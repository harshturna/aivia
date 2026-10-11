import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { guardGeneration } from "@/lib/ai/guard";
import { recentHistory } from "@/lib/ai/history";
import { createAgentTools } from "@/lib/ai/tools";
import { isGuestId } from "@/lib/guest-user";
import {
  ensureSession,
  isSessionId,
  messageText,
  renameSession,
  saveMessages,
  titleFromBrief,
} from "@/lib/sessions";

// The agent can chain several media generations in one turn.
export const maxDuration = 300;

const SYSTEM_PROMPT = [
  "You are Aivia, a creative studio agent built by Harsh.",
  "",
  "You have tools that generate images, video, music and sound effects, and a",
  "web search tool.",
  "Use them to actually produce what the user asks for rather than describing",
  "what you would make. A request like 'design a logo and write three taglines'",
  "means: call the image tool, and write the taglines yourself.",
  "",
  "Search the web before answering when the answer depends on current",
  "information: recent events, current prices or availability, who currently",
  "holds a role, or anything the user flags as time-sensitive. Also search when",
  "briefing yourself on a real brand or product before designing for it.",
  "",
  "After searching, write the answer in your own words as complete sentences",
  "and ordinary paragraphs. Do not stitch the reply together out of quoted",
  "fragments, and do not list sources inline — the interface already shows",
  "every source it used.",
  "",
  "When the work takes more than one step, open your reply with the plan as a",
  "numbered list, one short line per step, in the order you will do them, with",
  "nothing before it. Then do the steps in that order. One step needs no plan.",
  "",
  "When the user attaches a document, answer from it: quote or paraphrase the",
  "passage you rely on, and say so plainly when the document does not cover it.",
  "",
  "When a tool returns, do not repeat the URL back in your text. The interface",
  "renders the result already. Briefly say what you made and why it fits.",
  "",
  "Media generation costs real money and takes time. Generate what was asked",
  "for and no more; do not produce speculative extra variations.",
  "",
  "If a tool returns an error, say plainly that it failed and quote the error.",
  "Do not guess at the cause or invent a limitation of the tool — you cannot",
  "tell from an error message why a model rejected a request.",
].join("\n");

export async function POST(req: Request) {
  // the cost is reserved by the guard; an error before streaming refunds it. Once the run
  // streams it keeps the charge, cancelled or not: the work still runs (TICKET-042).
  let refund: (() => Promise<void>) | undefined;
  try {
    const { id, messages }: { id?: string; messages: UIMessage[] } =
      await req.json();

    if (!messages?.length) {
      return new Response("Messages are required", { status: 400 });
    }
    const history = recentHistory(messages);
    if (!history) {
      return new Response("The brief is too long. Shorten it and send again.", {
        status: 413,
      });
    }

    // Quota is checked once per request, not once per tool call. A single
    // prompt that legitimately fans out to three tools should not cost the
    // user three credits.
    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;
    refund = guard.refund;

    // The chat id the client made is the session id (design §12). A new one becomes a row
    // named after its first brief; anything that is not a uuid runs unsaved, and so does
    // every guest run: the account is shared (TICKET-038).
    const userId = guard.user.id;
    let sessionId: string | null =
      id && isSessionId(id) && !isGuestId(userId) ? id : null;
    // an id this user cannot own (a stale link to someone else's session) runs unsaved
    // rather than failing on the unique key (TICKET-042)
    if (sessionId) {
      try {
        const session = await ensureSession(userId, sessionId);
        if (session.title === "New session") {
          const first = messages.find((m) => m.role === "user");
          if (first)
            await renameSession(
              userId,
              sessionId,
              titleFromBrief(messageText(first))
            );
        }
      } catch (error) {
        console.error("[SESSION]", error);
        sessionId = null;
      }
    }

    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(history),
      tools: {
        ...createAgentTools({ userId, sessionId }),
        // Server-side: Anthropic runs the search, so there is nothing to
        // execute here and no separate search API key to hold. The _20260209
        // variant filters results before they reach the context window.
        web_search: anthropic.tools.webSearch_20260209({ maxUses: 5 }),
      },
      // Enough room to plan, call two or three tools, and summarise. Without a
      // bound, a confused model can loop until it exhausts the budget.
      stopWhen: stepCountIs(8),
      providerOptions: {
        anthropic: {
          // Orchestration benefits from planning; keep it modest so the first
          // token still arrives quickly.
          thinking: { type: "adaptive", display: "summarized" },
          effort: "medium",
        },
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        sendReasoning: true,
        originalMessages: messages,
        // Saved when the stream ends, aborted or not: the assets are already rows (the
        // tools write them), this keeps the transcript that shows them.
        onFinish: async ({ messages: all }) => {
          if (!sessionId) return;
          try {
            await saveMessages(userId, sessionId, all);
          } catch (error) {
            console.error("[AGENT_SAVE]", error);
          }
        },
        // Without this the SDK replaces every tool failure with the string
        // "An error occurred." The model then has nothing to report and
        // invents a plausible-sounding reason instead — a generate_music
        // failure came back to the user as "the tool only supports musical
        // content", which was pure confabulation.
        onError: (error) => {
          console.error("[AGENT_TOOL_ERROR]", error);
          return error instanceof Error ? error.message : String(error);
        },
      }),
    });
  } catch (error) {
    await refund?.();
    console.error("[AGENT_ERROR]", error);
    return new Response("Internal error", { status: 500 });
  }
}
