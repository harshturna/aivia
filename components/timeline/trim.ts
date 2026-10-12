import { findItem, packMain, trimEnd, trimStart } from "@/lib/timeline/ops";
import type { TimelineDoc } from "@/lib/timeline/schema";

/**
 * The storyboard's trim sheet (D-005 §17.4, TICKET-066) in source terms: a clip's two handles sit
 * at its in- and out-points over the whole source; a still's one value is its length. Each
 * setter turns a handle's new place into the timeline's own trim, so the clamps are the same.
 */
export const STILL_MS = { min: 1000, max: 10_000 } as const;

/** Where a clip's handles sit, and the length of the source under them. */
export function clipRange(doc: TimelineDoc, id: string) {
  const hit = findItem(doc, id);
  if (!hit || (hit.item.type !== "video" && hit.item.type !== "audio"))
    return null;
  const { item } = hit;
  const to = item.in + item.duration;
  const source = Math.max(to, doc.media[item.media]?.durationMs ?? to);
  return { source, from: item.in, to };
}

/**
 * Moves a clip's in-point to `ms` of its source; its out-point stays. A storyboard has no
 * places, so the opening shot keeps its start rather than leaving a gap before it.
 */
export function setIn(doc: TimelineDoc, id: string, ms: number) {
  const range = clipRange(doc, id);
  const hit = findItem(doc, id);
  if (!range || !hit) return doc;
  const next = trimStart(doc, id, ms - range.from);
  const moved = findItem(next, id);
  if (hit.track.kind !== "main" || hit.index !== 0 || !moved) return next;
  moved.item.start = hit.item.start;
  return packMain(next);
}

/** Moves a clip's out-point to `ms` of its source; its in-point stays. */
export function setOut(doc: TimelineDoc, id: string, ms: number) {
  const range = clipRange(doc, id);
  return range ? trimEnd(doc, id, ms - range.to) : doc;
}

/** A still's length, within a second and ten. */
export function setLength(doc: TimelineDoc, id: string, ms: number) {
  const hit = findItem(doc, id);
  if (hit?.item.type !== "image") return doc;
  const next = Math.min(STILL_MS.max, Math.max(STILL_MS.min, Math.round(ms)));
  return trimEnd(doc, id, next - hit.item.duration);
}
