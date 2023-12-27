import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { checkHardLimit, increaseHardLimit } from "@/lib/hard-limit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const user = await getUser("ROUTE_HANDLER");
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not cofigured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit("ROUTE_HANDLER");
    const isPro = await checkSubscription("ROUTE_HANDLER");
    const hardLimitNotReached = await checkHardLimit("ROUTE_HANDLER");

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    if (!hardLimitNotReached) {
      return new NextResponse("Limit reached", { status: 500 });
    }

    const response = await openai.images.generate({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    if (!isPro) {
      await increaseApiLimit("ROUTE_HANDLER");
    }

    await increaseHardLimit("ROUTE_HANDLER");

    return NextResponse.json(response.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
