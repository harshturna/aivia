import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import prismadb from "@/lib/prismadb";
import { guardGeneration } from "@/lib/ai/guard";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    if (!messages?.length) {
      return new Response("Input is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    // Scope the lookup to characters this user is allowed to see: their own,
    // plus the shared demo characters on the guest account. Previously this
    // was findUnique by id alone, so any signed-in user could talk to any
    // character and indirectly read its instructions and seed.
    const character = await prismadb.character.findFirst({
      where: {
        id: params.chatId,
        OR: [{ userId: guard.user.id }, { userId: process.env.GUEST_USER_ID }],
      },
    });

    if (!character) {
      return new Response("Character not found", { status: 404 });
    }

    // The persona belongs in the system prompt. The previous implementation
    // used LangChain's legacy completions wrapper, which flattened the whole
    // conversation into a single prompt string and had no notion of roles.
    const system = [
      `You are ${character.name}. ${character.description}`,
      "",
      "Speak in the first person, as the character, always.",
      `Never prefix your reply with "${character.name}:" or any other name or label.`,
      "Reply with at least one complete sentence. Stay in character at all times.",
      "",
      "Background about you:",
      character.instructions,
      "",
      "Relevant details about your past and this conversation:",
      character.seed,
    ].join("\n");

    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        anthropic: {
          // Roleplay wants voice, not deliberation. Disabling thinking was only
          // marginally faster to first token here (2.75s vs 3.14s, single
          // samples, so treat as noise-adjacent) but it does avoid paying for
          // thinking tokens on every turn of a public demo.
          thinking: { type: "disabled" },
          effort: "low",
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
    console.error("[CHAT_POST]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
