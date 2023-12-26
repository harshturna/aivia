import { StreamingTextResponse } from "ai";
import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await getUser("ROUTE_HANDLER");

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user?.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const character = await prismadb.character.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
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

    const memoryManager = MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(characterKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(character.seed, "\n\n", characterKey);
    }

    await memoryManager.writeToHistory("User: " + prompt + "\n", characterKey);
    const recentChatHistory = await memoryManager.readLatestHistory(
      characterKey
    );
    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      character_file_name
    );

    let relevantHistory = "";

    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    const model = new OpenAI({
      modelName: "gpt-3.5-turbo-instruct",
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const resp = await model
      .call(
        `ONLY generate sentences in the first person, speaking as the character directly. DO NOT use any prefixes like "${character.name}:" or other identifiers before the response. Respond in at least one complete sentence.\nBelow is the background about you as the character:\n${character.instructions}.\n\nBelow are the relevant details about your past and the current conversation:\n${relevantHistory}\n${recentChatHistory}\n\nFor example, instead of saying "Albert: I think...", simply start with "I think...".`
      )
      .catch(console.error);

    if (!resp) {
      return new NextResponse("Error generating response", { status: 500 });
    }

    const response = resp.trim();

    await memoryManager.writeToHistory("" + response.trim(), characterKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);

    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory(
        `${character.name}: ` + response.trim(),
        characterKey
      );

      await prismadb.character.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(s);
  } catch (error) {
    console.log("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
