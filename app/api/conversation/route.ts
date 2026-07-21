import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { guardGeneration } from "@/lib/ai/guard";

// Streaming responses can run longer than the default serverless budget.
export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Your name is Aivia, created by Harsh. You are a helpful, friendly and " +
  "energetic assistant. Talk in a human-like way. Use markdown for structure " +
  "when it aids readability.";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages?.length) {
      return new Response("Messages are required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const result = streamText({
      // Swap to "claude-opus-4-8" for the hardest work; nothing else changes.
      model: anthropic("claude-sonnet-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        anthropic: {
          // Sonnet 5 runs adaptive thinking by default, which costs ~2.5s of
          // latency before the first token. This is a casual chat assistant,
          // so trade reasoning depth for responsiveness.
          thinking: { type: "adaptive" },
          effort: "low",
        },
      },
      // Only bill the user once the model actually produced something.
      onFinish: async () => {
        await guard.consume();
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new Response("Internal error", { status: 500 });
  }
}
