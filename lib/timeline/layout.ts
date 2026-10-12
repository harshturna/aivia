import {
  type AudioItem,
  endOf,
  type ImageItem,
  type TextItem,
  type TimelineDoc,
  type VideoItem,
  type VisualItem,
} from "./schema";

/**
 * What a cut shows and plays at a moment (TICKET-061). Pure, so the player and export draw
 * from the same answer and it can be tested. Visible items come back in drawing order: the
 * main track first, an incoming item over the outgoing one, then text on top.
 */

export type Layer =
  | { kind: "video"; item: VideoItem; alpha: number; sourceMs: number }
  | { kind: "image"; item: ImageItem; alpha: number; zoom: number }
  | { kind: "text"; item: TextItem; alpha: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** An item's opacity at `ms`: 0 outside it, ramping over its fades at either edge. */
export function alphaOf(
  item: { start: number; duration: number },
  fadeIn: number,
  fadeOut: number,
  ms: number
) {
  const end = endOf(item);
  if (ms < item.start || ms >= end) return 0;
  const a = fadeIn > 0 ? (ms - item.start) / fadeIn : 1;
  const b = fadeOut > 0 ? (end - ms) / fadeOut : 1;
  return clamp01(Math.min(a, b));
}

/**
 * The fades a main-track item really has (TICKET-074): its own, and over a crossfade the
 * incoming item fades in on top of the outgoing one, which holds at full strength beneath it.
 * (Fading both would let the background through at the middle.) The fade in is never longer
 * than the overlap the packing really made.
 */
export function mainFades(items: VisualItem[], index: number) {
  const item = items[index];
  const prev = items[index - 1];
  const overlap = prev ? Math.max(0, endOf(prev) - item.start) : undefined;
  const crossfade = item.transitionIn
    ? Math.min(
        item.transitionIn.duration,
        overlap ?? item.transitionIn.duration
      )
    : 0;
  return {
    fadeIn: Math.max(item.fadeIn ?? 0, crossfade),
    fadeOut: item.fadeOut ?? 0,
  };
}

export function layersAt(doc: TimelineDoc, ms: number): Layer[] {
  const out: Layer[] = [];
  const frame = 1000 / doc.fps;
  for (const track of doc.tracks) {
    if (track.kind !== "main") continue;
    const items = [...track.items].sort((a, b) => a.start - b.start);
    items.forEach((item, i) => {
      const { fadeIn, fadeOut } = mainFades(items, i);
      const alpha = alphaOf(item, fadeIn, fadeOut, ms);
      if (alpha <= 0) return;
      if (item.type === "video") {
        const length = doc.media[item.media]?.durationMs;
        const local = item.in + (ms - item.start);
        const sourceMs =
          length === undefined
            ? local
            : Math.min(Math.max(0, local), Math.max(0, length - frame));
        out.push({ kind: "video", item, alpha, sourceMs });
      } else {
        const k = (ms - item.start) / item.duration;
        const from = item.motion?.from ?? 1;
        const to = item.motion?.to ?? 1;
        out.push({ kind: "image", item, alpha, zoom: from + (to - from) * k });
      }
    });
  }
  for (const track of doc.tracks) {
    if (track.kind !== "text") continue;
    for (const item of track.items) {
      const alpha = alphaOf(item, item.fadeIn ?? 0, item.fadeOut ?? 0, ms);
      if (alpha > 0) out.push({ kind: "text", item, alpha });
    }
  }
  return out;
}

/**
 * An audio item's level over time as ramp points (ms, gain), for an AudioParam: silent at its
 * start, up to its volume over its fade in, held, down to silence over its fade out.
 */
export function gainEnvelope(item: AudioItem): Array<[number, number]> {
  const end = endOf(item);
  const fadeIn = Math.min(item.fadeIn ?? 0, item.duration);
  const fadeOut = Math.min(item.fadeOut ?? 0, item.duration - fadeIn);
  const v = item.volume;
  const points: Array<[number, number]> = [[item.start, fadeIn > 0 ? 0 : v]];
  if (fadeIn > 0) points.push([item.start + fadeIn, v]);
  if (fadeOut > 0) points.push([end - fadeOut, v], [end, 0]);
  else points.push([end, v]);
  return points;
}
