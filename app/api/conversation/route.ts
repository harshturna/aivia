import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { increaseHardLimit, checkHardLimit } from "@/lib/hard-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const user = await getUser("ROUTE_HANDLER");
    const body = await req.json();
    const { messages } = body;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not cofigured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit("ROUTE_HANDLER");
    const isPro = await checkSubscription("ROUTE_HANDLER");
    const hardLimitNotReached = await checkHardLimit("ROUTE_HANDLER");
    console.log(hardLimitNotReached);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    if (!hardLimitNotReached) {
      return new NextResponse("Limit reached", { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    if (!isPro) {
      await increaseApiLimit("ROUTE_HANDLER");
    }

    await increaseHardLimit("ROUTE_HANDLER");

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
