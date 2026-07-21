import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { guardGeneration } from "@/lib/ai/guard";

export const maxDuration = 120;

const SYSTEM_PROMPT = [
  "You are Aivia, answering questions about documents the user has attached.",
  "",
  "Ground every answer in the attached documents. Quote or paraphrase the",
  "relevant passage so the user can see where the answer came from, and say",
  "which document it came from when more than one is attached.",
  "",
  "If the documents do not contain the answer, say so plainly rather than",
  "filling the gap from general knowledge. If you do add outside context, mark",
  "it clearly as outside the documents.",
].join("\n");

/**
 * Document chat.
 *
 * Deliberately has no vector store, no embeddings and no chunking. Sonnet 5
 * has a 1M token context window, so for the document sizes a browser upload
 * realistically produces, putting the whole file in context beats retrieval:
 * no infrastructure, no chunk-boundary misses, and the model sees the document
 * whole. It also matches the app's ephemeral model — the document lives in the
 * request, never on disk.
 *
 * Revisit only if users start attaching corpora rather than documents.
 */
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages?.length) {
      return new Response("Messages are required", { status: 400 });
    }

    const hasDocument = messages.some((message) =>
      message.parts?.some((part) => part.type === "file")
    );

    if (!hasDocument) {
      return new Response(
        "Attach a document first, then ask a question about it.",
        { status: 400 }
      );
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        anthropic: {
          // Reading comprehension over a long document benefits from thinking.
          thinking: { type: "adaptive" },
          effort: "medium",
        },
      },
      onFinish: async () => {
        await guard.consume();
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[DOCUMENTS_ERROR]", error);
    return new Response("Internal error", { status: 500 });
  }
}
