import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  stepCountIs,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { guardGeneration } from "@/lib/ai/guard";
import { agentTools } from "@/lib/ai/tools";

// The agent can chain several media generations in one turn.
export const maxDuration = 300;

const SYSTEM_PROMPT = [
  "You are Aivia, a creative studio agent built by Harsh.",
  "",
  "You have tools that generate images, video and music, and a web search tool.",
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
  "Before doing multi-step work, state your plan in one or two short sentences",
  "so the user can follow along. Then execute it.",
  "",
  "When a tool returns, do not repeat the URL back in your text. The interface",
  "renders the result already. Briefly say what you made and why it fits.",
  "",
  "Media generation costs real money and takes time. Generate what was asked",
  "for and no more; do not produce speculative extra variations.",
].join("\n");

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages?.length) {
      return new Response("Messages are required", { status: 400 });
    }

    // Quota is checked once per request, not once per tool call. A single
    // prompt that legitimately fans out to three tools should not cost the
    // user three credits.
    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: {
        ...agentTools,
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
      onFinish: async () => {
        await guard.consume();
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream, sendReasoning: true }),
    });
  } catch (error) {
    console.error("[AGENT_ERROR]", error);
    return new Response("Internal error", { status: 500 });
  }
}
