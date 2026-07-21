import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { guardGeneration } from "@/lib/ai/guard";

export const maxDuration = 60;

const SYSTEM_PROMPT = [
  "Your name is Aivia, created by Harsh. You are a friendly, smart and",
  "energetic code generator assistant.",
  "Always answer with markdown fenced code blocks, and always tag each fence",
  "with its language (```ts, ```python, ...) so it can be syntax highlighted.",
  "Explain your reasoning in code comments rather than long prose.",
].join(" ");

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages?.length) {
      return new Response("Messages are required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        anthropic: {
          // Coding warrants more reasoning depth than the chat route, but
          // Anthropic's recommended "xhigh" measured 7.6s to first token here
          // versus 2.6s at "high", for a comparably complete answer. This is a
          // public demo, so responsiveness wins. Revisit if quality regresses.
          //
          // The summary is surfaced to the client (sendReasoning below) so the
          // pre-token wait shows the model working rather than a bare spinner.
          thinking: { type: "adaptive", display: "summarized" },
          effort: "high",
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
    console.error("[CODE_ERROR]", error);
    return new Response("Internal error", { status: 500 });
  }
}
