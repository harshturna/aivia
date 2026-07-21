import { runFal, extractUrl } from "@/lib/ai/fal";

/**
 * The app's media capabilities as plain functions.
 *
 * These are called from two places: the original single-purpose routes
 * (/api/image, /api/video, /api/music) and the agent's tools. Keeping one
 * implementation means the agent and the manual forms cannot drift apart.
 *
 * None of these check quota. Callers are responsible for going through
 * lib/ai/guard first — the agent applies it once per request rather than once
 * per tool call, otherwise a single prompt could burn several credits.
 */

// ~2s, ~$0.003. Swap to fal-ai/flux/dev or flux-pro/v1.1 for more fidelity.
export const IMAGE_MODEL = "fal-ai/flux/schnell";
// Kling on fal is image-to-video; Seedance is the text-to-video option.
export const VIDEO_MODEL = "bytedance/seedance-2.0/fast/text-to-video";
export const MUSIC_MODEL = "fal-ai/minimax-music/v2.6";

interface FalImageResponse {
  images?: Array<{ url: string; width?: number; height?: number }>;
}

export async function generateImages({
  prompt,
  amount = 1,
  width = 1024,
  height = 1024,
}: {
  prompt: string;
  amount?: number;
  width?: number;
  height?: number;
}): Promise<string[]> {
  const data = await runFal<FalImageResponse>(IMAGE_MODEL, {
    prompt,
    num_images: Math.min(Math.max(amount, 1), 4),
    image_size: { width, height },
    output_format: "jpeg",
  });

  const urls = (data.images ?? []).map((image) => image.url).filter(Boolean);

  if (!urls.length) {
    throw new Error("Image generation returned no images");
  }

  return urls;
}

export async function generateVideo(prompt: string): Promise<string> {
  const url = extractUrl(await runFal(VIDEO_MODEL, { prompt }));

  if (!url) {
    throw new Error("Video generation returned no video");
  }

  return url;
}

export async function generateMusic(prompt: string): Promise<string> {
  const url = extractUrl(await runFal(MUSIC_MODEL, { prompt }));

  if (!url) {
    throw new Error("Music generation returned no audio");
  }

  return url;
}
