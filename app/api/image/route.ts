import { NextResponse } from "next/server";

import { guardGeneration } from "@/lib/ai/guard";
import { runFal } from "@/lib/ai/fal";

export const maxDuration = 60;

// FLUX Schnell: ~2s per image at roughly $0.003, which is the right trade for
// a public demo. Swap to fal-ai/flux/dev or flux-pro/v1.1 for more fidelity.
const IMAGE_MODEL = "fal-ai/flux/schnell";

interface FalImageResponse {
  images?: Array<{ url: string; width?: number; height?: number }>;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, amount = 1, resolution = "1024x1024" } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const guard = await guardGeneration();
    if (!guard.ok) return guard.response;

    const [width, height] = String(resolution)
      .split("x")
      .map((n) => parseInt(n, 10));

    const data = await runFal<FalImageResponse>(IMAGE_MODEL, {
      prompt,
      num_images: Math.min(parseInt(String(amount), 10) || 1, 4),
      image_size:
        Number.isFinite(width) && Number.isFinite(height)
          ? { width, height }
          : { width: 1024, height: 1024 },
      output_format: "jpeg",
    });

    const images = data.images ?? [];

    if (!images.length) {
      console.error("[IMAGE_ERROR] no images in fal response", data);
      return new NextResponse("No images generated", { status: 502 });
    }

    await guard.consume();

    // Preserve the existing client contract: an array of { url }.
    return NextResponse.json(images.map((image) => ({ url: image.url })));
  } catch (error) {
    console.error("[IMAGE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
