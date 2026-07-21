import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { runFal, extractUrl } from "@/lib/ai/fal";

export const maxDuration = 300;

// Replaces riffusion (Dec 2022), which is a loop/variation tool rather than a
// song generator. MiniMax Music produces a full track for about $0.035.
const MUSIC_MODEL = "fal-ai/minimax-music/v2.6";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const data = await runFal(MUSIC_MODEL, { prompt });
    const url = extractUrl(data);

    if (!url) {
      console.error("[MUSIC_ERROR] no audio url in fal response", data);
      return new NextResponse("No music generated", { status: 502 });
    }

    await guard.consume();

    // Preserve the existing client contract: response.data.audio is the url.
    return NextResponse.json({ audio: url });
  } catch (error) {
    console.error("[MUSIC_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
