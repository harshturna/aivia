import { z } from "zod";

/**
 * Direct modes (design §5.4): the composer's Image, Video, Music and Sound send the brief
 * straight to one capability. This module validates the request and maps the composer's
 * parameters to the capability's arguments; it has no I/O so it is unit-tested.
 */
export const DirectRequest = z.object({
  mode: z.enum(["image", "video", "music", "sound"]),
  params: z
    .object({
      aspect: z.enum(["1:1", "3:4", "4:3", "16:9", "9:16"]).default("1:1"),
      count: z.number().int().min(1).max(4).default(1),
      videoSeconds: z
        .union([z.literal(6), z.literal(8), z.literal(10)])
        .default(6),
      musicSeconds: z
        .union([z.literal(15), z.literal(30), z.literal(60)])
        .default(30),
      soundSeconds: z
        .union([z.literal(0), z.literal(2), z.literal(5), z.literal(10)])
        .default(0),
    })
    .default({
      aspect: "1:1",
      count: 1,
      videoSeconds: 6,
      musicSeconds: 30,
      soundSeconds: 0,
    }),
});
export type DirectRequest = z.infer<typeof DirectRequest>;

/**
 * Edge sizes per aspect, each a multiple of 32 and under one megapixel: fal bills images by
 * rounding up to the next megapixel (see IMAGE_DEFAULT_EDGE in capabilities.ts).
 */
export const ASPECT_SIZES: Record<
  DirectRequest["params"]["aspect"],
  { width: number; height: number }
> = {
  "1:1": { width: 992, height: 992 },
  "3:4": { width: 864, height: 1152 },
  "4:3": { width: 1152, height: 864 },
  "16:9": { width: 1312, height: 736 },
  "9:16": { width: 736, height: 1312 },
};

/** Generations a direct request spends: four images are four. */
export function costOf({ mode, params }: DirectRequest) {
  return mode === "image" ? params.count : 1;
}

export const TOOL_FOR_MODE = {
  image: "generate_image",
  video: "generate_video",
  music: "generate_music",
  sound: "generate_sound_effect",
} as const;
