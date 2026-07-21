import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { generateImages, IMAGE_DEFAULT_EDGE } from "@/lib/ai/capabilities";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, amount = 1, resolution = "" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const [width, height] = String(resolution)
      .split("x")
      .map((n) => parseInt(n, 10));

    const urls = await generateImages({
      prompt,
      amount: parseInt(String(amount), 10) || 1,
      width: Number.isFinite(width) ? width : IMAGE_DEFAULT_EDGE,
      height: Number.isFinite(height) ? height : IMAGE_DEFAULT_EDGE,
    });

    await guard.consume();

    // Existing client contract: an array of { url }.
    return NextResponse.json(urls.map((url) => ({ url })));
  } catch (error) {
    console.error("[IMAGE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
