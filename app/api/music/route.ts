import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { checkHardLimit, increaseHardLimit } from "@/lib/hard-limit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const user = await getUser("ROUTE_HANDLER");
    const body = await req.json();
    const { prompt } = body;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
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

    const response = await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
        },
      }
    );

    if (!isPro) {
      await increaseApiLimit("ROUTE_HANDLER");
    }

    await increaseHardLimit("ROUTE_HANDLER");

    return NextResponse.json(response);
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
