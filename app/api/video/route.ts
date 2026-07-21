import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { runFal, extractUrl } from "@/lib/ai/fal";

// Video generation is slow relative to everything else here.
export const maxDuration = 300;

// Replaces anotherjesse/zeroscope-v2-xl (July 2023). Note that Kling on fal is
// image-to-video; the text-to-video endpoints are Seedance, Grok Imagine and
// Gemini. Seedance's fast tier is the cheapest text-to-video option.
const VIDEO_MODEL = "bytedance/seedance-2.0/fast/text-to-video";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const data = await runFal(VIDEO_MODEL, { prompt });
    const url = extractUrl(data);

    if (!url) {
      console.error("[VIDEO_ERROR] no video url in fal response", data);
      return new NextResponse("No video generated", { status: 502 });
    }

    await guard.consume();

    // Preserve the existing client contract: response.data[0] is the url.
    return NextResponse.json([url]);
  } catch (error) {
    console.error("[VIDEO_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
