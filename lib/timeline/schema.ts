import { z } from "zod";

/**
 * A cut as data (D-005, TICKET-061): one versioned document per edit, read by the player, the
 * timeline and export alike. Times are integer milliseconds, so nothing drifts and the frame
 * rate is applied only when drawing. Media is referenced, never copied: items point into the
 * `media` map, which holds each piece's address once. Colours and fonts are names the renderer
 * resolves to the design tokens.
 */

export const TIMELINE_VERSION = 1;

const ms = z.number().int().min(0);
const id = z.string().min(1).max(64);
const fades = { fadeIn: ms.optional(), fadeOut: ms.optional() };
const span = { id, start: ms, duration: ms.min(1) };

export const mediaSchema = z.object({
  url: z.string().min(1).max(2048),
  /** Absent for the guest's media; filled when it is claimed. */
  assetId: z.string().optional(),
  kind: z.enum(["video", "image", "music", "sound"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: ms.optional(),
});

export const transitionSchema = z.object({
  kind: z.literal("crossfade"),
  duration: ms.min(1),
});

/** A still's slow push: the scale at its first and last frame. */
const motionSchema = z.object({
  from: z.number().positive(),
  to: z.number().positive(),
});

const textStyleSchema = z.object({
  preset: z.enum(["title", "caption"]),
  /** Over a darkening scrim, as an end card's line is. */
  scrim: z.boolean().optional(),
});

export const videoItemSchema = z.object({
  ...span,
  ...fades,
  type: z.literal("video"),
  media: id,
  /** Where in the source this item starts. */
  in: ms,
  volume: z.number().min(0).max(1).default(0),
  transitionIn: transitionSchema.optional(),
});

export const imageItemSchema = z.object({
  ...span,
  ...fades,
  type: z.literal("image"),
  media: id,
  motion: motionSchema.optional(),
  /** Words drawn over the picture, as an end card has. */
  text: z.string().max(200).optional(),
  transitionIn: transitionSchema.optional(),
});

export const textItemSchema = z.object({
  ...span,
  ...fades,
  type: z.literal("text"),
  text: z.string().min(1).max(200),
  style: textStyleSchema,
});

export const audioItemSchema = z.object({
  ...span,
  ...fades,
  type: z.literal("audio"),
  media: id,
  in: ms,
  volume: z.number().min(0).max(1).default(1),
});

export const trackSchema = z.discriminatedUnion("kind", [
  z.object({
    id,
    kind: z.literal("main"),
    items: z.array(z.union([videoItemSchema, imageItemSchema])),
  }),
  z.object({ id, kind: z.literal("text"), items: z.array(textItemSchema) }),
  z.object({
    id,
    kind: z.literal("audio"),
    role: z.enum(["score", "sound"]),
    items: z.array(audioItemSchema),
  }),
]);

export const timelineSchema = z.object({
  schema: z.literal("aivia.timeline"),
  version: z.literal(TIMELINE_VERSION),
  fps: z.union([z.literal(24), z.literal(30)]),
  /** The frame, in pixels: export draws at this size. */
  width: z.number().int().min(2),
  height: z.number().int().min(2),
  media: z.record(id, mediaSchema),
  tracks: z.array(trackSchema).max(8),
});

export type TimelineDoc = z.infer<typeof timelineSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type Track = z.infer<typeof trackSchema>;
export type VideoItem = z.infer<typeof videoItemSchema>;
export type ImageItem = z.infer<typeof imageItemSchema>;
export type VisualItem = VideoItem | ImageItem;
export type TextItem = z.infer<typeof textItemSchema>;
export type AudioItem = z.infer<typeof audioItemSchema>;
export type Item = VisualItem | TextItem | AudioItem;

/** Where an item ends. */
export const endOf = (item: { start: number; duration: number }) =>
  item.start + item.duration;

/** The cut's length: the latest end of anything seen. Sound past it is cut. */
export function docDuration(doc: TimelineDoc) {
  let end = 0;
  for (const track of doc.tracks)
    if (track.kind !== "audio")
      for (const item of track.items) end = Math.max(end, endOf(item));
  return end;
}

/** An empty cut at a size, for a project that has none yet. */
export function emptyDoc(width = 1280, height = 720): TimelineDoc {
  return {
    schema: "aivia.timeline",
    version: TIMELINE_VERSION,
    fps: 24,
    width,
    height,
    media: {},
    tracks: [
      { id: "text", kind: "text", items: [] },
      { id: "main", kind: "main", items: [] },
      { id: "score", kind: "audio", role: "score", items: [] },
      { id: "sound", kind: "audio", role: "sound", items: [] },
    ],
  };
}
