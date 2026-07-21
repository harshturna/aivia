import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { generateVideo } from "@/lib/ai/capabilities";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const url = await generateVideo(prompt);

    await guard.consume();

    // Existing client contract: response.data[0] is the url.
    return NextResponse.json([url]);
  } catch (error) {
    console.error("[VIDEO_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
