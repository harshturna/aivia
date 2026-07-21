import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { generateMusic } from "@/lib/ai/capabilities";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const url = await generateMusic(prompt);

    await guard.consume();

    // Existing client contract: response.data.audio is the url.
    return NextResponse.json({ audio: url });
  } catch (error) {
    console.error("[MUSIC_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
