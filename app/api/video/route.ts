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
      "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
      {
        input: {
          prompt,
        },
      }
    );

    if (!isPro) {
      await increaseApiLimit("ROUTE_HANDLER");
    }

    await increaseHardLimit("ROUTE_HANDLER");

    return NextResponse.json(response);
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
