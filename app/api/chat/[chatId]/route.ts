import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import prismadb from "@/lib/prismadb";
import { checkHardLimit, increaseHardLimit } from "@/lib/hard-limit";

interface Message {
  role: "system" | "user";
  content: string;
}

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { messages } = await request.json();
    const user = await getUser("ROUTE_HANDLER");

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Input is required", { status: 400 });
    }

    const hardLimitNotReached = await checkHardLimit("ROUTE_HANDLER");

    if (!hardLimitNotReached) {
      return new NextResponse("Limit reached", { status: 500 });
    }

    const character = await prismadb.character.findUnique({
      where: {
        id: params.chatId,
      },
    });

    if (!character) {
      return new NextResponse("Character not found", { status: 404 });
    }

    const name = character.id;
    const character_file_name = name + ".txt";
    const characterKey = {
      characterName: name,
      userId: user.id,
      modelName: "llama2-13b",
    };

    const model = new OpenAI({
      modelName: "gpt-4",
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const formattedMessages = messages
      .map((message: Message) => `${message.role}: ${message.content}`)
      .join("\n");

    const resp = await model
      .call(
        `ONLY generate sentences in the first person, speaking as the character directly. DO NOT use any prefixes like "${character.name}:" or other identifiers before the response. Respond in at least one complete sentence.\nBelow is the background about you as the character:\n${character.instructions}.\n\nBelow are the relevant details about your past and the current conversation:\n${character.seed}\n${formattedMessages}\n\nFor example, instead of saying "${character.name}: I think...", simply start with "I think...".`
      )
      .catch(console.error);

    if (!resp) {
      return new NextResponse(`Error generating response`, { status: 500 });
    }

    const response = {
      role: "system",
      content: resp.trim(),
    };

    await increaseHardLimit("ROUTE_HANDLER");

    return NextResponse.json(response);
  } catch (error) {
    console.log("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
