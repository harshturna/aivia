import { extractUrl, runFal } from "@/lib/ai/fal";

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

// ~2s, $0.003 per megapixel. Swap to fal-ai/flux/dev or flux-pro/v1.1 for
// more fidelity.
export const IMAGE_MODEL = "fal-ai/flux/schnell";

/**
 * Not 1024. fal bills images by rounding *up* to the nearest megapixel, and
 * 1024x1024 is 1.048 MP — it bills as 2 MP, so it costs double ($0.006 vs
 * $0.003) for 5% more pixels. 992x992 is 0.98 MP, stays inside one megapixel,
 * and is still a multiple of 32.
 */
export const IMAGE_DEFAULT_EDGE = 992;

/**
 * $0.15 per clip, flat (fal model page, checked 2026-10-11): 121 frames at 24 fps is five
 * seconds at 720p. Pinned at five seconds, the length the flat price is stated for.
 *
 * Replaces fal-ai/ltx-2/text-to-video/fast ($0.04 per second at 1080p, $0.24 to $0.40 a
 * clip), which answered "Downstream service error" on every call from 2026-10-10
 * (TICKET-019); that replaced bytedance/seedance-2.0/fast at $0.2419 per second.
 */
export const VIDEO_MODEL = "fal-ai/wan/v2.2-5b/text-to-video";
export const VIDEO_SECONDS = 5;
export type VideoAspect = "16:9" | "9:16" | "1:1";

// $0.02 per output minute, so ~$0.01 for a 30s clip. Replaces
// fal-ai/minimax-music/v2.6, which was $0.15 flat per generation — 15x more —
// and rejected every call this app made: it requires either non-empty
// `lyrics` or `is_instrumental: true`, and we sent a bare prompt.
/**
 * Animate a still (TICKET-039): $0.15 per clip, flat (fal model page, checked 2026-10-11).
 * 121 frames at 24 fps is five seconds at 720p. Charged as one generation, like a video.
 */
export const ANIMATE_MODEL = "fal-ai/wan/v2.2-5b/image-to-video";
export const ANIMATE_SECONDS = 5;
export type AnimateAspect = "16:9" | "9:16" | "1:1";

export const MUSIC_MODEL = "cassetteai/music-generator";
export const MUSIC_DURATION_SECONDS = 30;

// $0.002 per second. Music models produce nonsense for "a lion's roar"; this
// is the model for non-musical audio.
export const SFX_MODEL = "fal-ai/elevenlabs/sound-effects/v2";

interface FalImageResponse {
  images?: Array<{ url: string; width?: number; height?: number }>;
}

export async function generateImages({
  prompt,
  amount = 1,
  width = IMAGE_DEFAULT_EDGE,
  height = IMAGE_DEFAULT_EDGE,
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

export async function generateVideo(
  prompt: string,
  aspect: VideoAspect = "16:9"
): Promise<string> {
  // length, rate and size are pinned rather than left to the endpoint's defaults (81 frames)
  const url = extractUrl(
    await runFal(VIDEO_MODEL, {
      prompt,
      resolution: "720p",
      aspect_ratio: aspect,
      num_frames: VIDEO_SECONDS * 24 + 1,
      frames_per_second: 24,
    })
  );

  if (!url) {
    throw new Error("Video generation returned no video");
  }

  return url;
}

export async function generateMusic(
  prompt: string,
  durationSeconds: number = MUSIC_DURATION_SECONDS
): Promise<string> {
  // `duration` is required and must be an integer; omitting it is a 422.
  const url = extractUrl(
    await runFal(MUSIC_MODEL, {
      prompt,
      duration: Math.round(durationSeconds),
    })
  );

  if (!url) {
    throw new Error("Music generation returned no audio");
  }

  return url;
}

export async function generateSoundEffect(
  prompt: string,
  durationSeconds?: number
): Promise<string> {
  // Note the field is `text`, not `prompt`, on this endpoint.
  const url = extractUrl(
    await runFal(SFX_MODEL, {
      text: prompt,
      ...(durationSeconds ? { duration_seconds: durationSeconds } : {}),
    })
  );

  if (!url) {
    throw new Error("Sound effect generation returned no audio");
  }

  return url;
}

/**
 * Brings a still to life: gentle motion from one image. `image` must be a URL fal can fetch
 * (an http(s) or data URL; see `publicImageUrl`). The aspect is explicit because the
 * endpoint's "auto" rejects some sizes.
 */
export async function animateImage({
  image,
  prompt,
  aspect,
}: {
  image: string;
  prompt: string;
  aspect: AnimateAspect;
}): Promise<string> {
  const url = extractUrl(
    await runFal(ANIMATE_MODEL, {
      image_url: image,
      prompt,
      resolution: "720p",
      aspect_ratio: aspect,
      num_frames: ANIMATE_SECONDS * 24 + 1,
      frames_per_second: 24,
    })
  );
  if (!url) throw new Error("Animation returned no video");
  return url;
}
