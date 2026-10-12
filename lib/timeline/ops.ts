import {
  type AudioItem,
  docDuration,
  endOf,
  type Item,
  type Media,
  type TextItem,
  type TimelineDoc,
  type Track,
  type VisualItem,
} from "./schema";

/**
 * Every edit a cut can take (D-005 §17.5, TICKET-065), as pure functions from one document to
 * the next, so the timeline, the storyboard and the tests share them and undo is a list of
 * documents. The main track is magnetic: its items sit end to end (less their crossfades) from
 * the first item's start; text and audio items sit where they are put.
 */

export const MIN_ITEM_MS = 200;
export const DEFAULTS = {
  clip: 5000,
  still: 3000,
  text: 2000,
  crossfade: 500,
  push: 1.06,
} as const;

const clone = (doc: TimelineDoc): TimelineDoc => structuredClone(doc);

function idsOf(doc: TimelineDoc) {
  const ids = new Set<string>();
  for (const t of doc.tracks) for (const i of t.items) ids.add(i.id);
  return ids;
}

/** A fresh id, unique in the document. */
function newId(doc: TimelineDoc, prefix: string) {
  const ids = idsOf(doc);
  for (let n = ids.size + 1; ; n++)
    if (!ids.has(`${prefix}-${n}`)) return `${prefix}-${n}`;
}

function newMediaKey(doc: TimelineDoc, kind: string) {
  for (let n = Object.keys(doc.media).length + 1; ; n++)
    if (!doc.media[`${kind}-${n}`]) return `${kind}-${n}`;
}

export function findItem(doc: TimelineDoc, id: string) {
  for (const track of doc.tracks) {
    const index = (track.items as Item[]).findIndex((i) => i.id === id);
    if (index >= 0)
      return { track, index, item: (track.items as Item[])[index] };
  }
  return null;
}

const mainOf = (doc: TimelineDoc) =>
  doc.tracks.find(
    (t): t is Extract<Track, { kind: "main" }> => t.kind === "main"
  );

/** The length the source allows from an in-point (a still or a card has no limit). */
function sourceLeft(doc: TimelineDoc, item: Item) {
  if (item.type !== "video" && item.type !== "audio")
    return Number.POSITIVE_INFINITY;
  const length = doc.media[item.media]?.durationMs;
  return length === undefined ? Number.POSITIVE_INFINITY : length - item.in;
}

/** Lays the main track end to end from its first item's start, overlapping by each crossfade. */
export function packMain(doc: TimelineDoc): TimelineDoc {
  const main = mainOf(doc);
  if (!main?.items.length) return doc;
  let t = main.items[0].start;
  main.items.forEach((item, i) => {
    if (i === 0) {
      delete item.transitionIn;
    } else {
      const x = Math.min(
        item.transitionIn?.duration ?? 0,
        item.duration,
        main.items[i - 1].duration
      );
      t -= x;
    }
    item.start = Math.max(0, t);
    t = item.start + item.duration;
  });
  return doc;
}

/** Puts a piece on the main track, at the end or at an index, crossfading in after the first. */
export function addToMain(
  doc: TimelineDoc,
  media: Media,
  index?: number
): { doc: TimelineDoc; id: string } {
  const next = clone(doc);
  const main = mainOf(next);
  if (!main) return { doc, id: "" };
  const key = newMediaKey(next, media.kind);
  next.media[key] = media;
  const at = Math.max(
    0,
    Math.min(index ?? main.items.length, main.items.length)
  );
  const id = newId(next, media.kind === "video" ? "clip" : "still");
  const base = {
    id,
    media: key,
    start:
      at === 0 ? 0 : main.items[at - 1].start + main.items[at - 1].duration,
    ...(at > 0 || main.items.length > 0
      ? {
          transitionIn: {
            kind: "crossfade" as const,
            duration: DEFAULTS.crossfade,
          },
        }
      : {}),
  };
  const item: VisualItem =
    media.kind === "video"
      ? {
          ...base,
          type: "video",
          in: 0,
          volume: 0,
          duration: Math.max(MIN_ITEM_MS, media.durationMs ?? DEFAULTS.clip),
        }
      : {
          ...base,
          type: "image",
          duration: DEFAULTS.still,
          motion: { from: 1, to: DEFAULTS.push },
        };
  main.items.splice(at, 0, item);
  return { doc: packMain(next), id };
}

/** A track or a sound on its row, from a time, as long as the cut (or its own length). */
export function addAudio(
  doc: TimelineDoc,
  media: Media,
  start = 0
): { doc: TimelineDoc; id: string } {
  const next = clone(doc);
  const role = media.kind === "music" ? "score" : "sound";
  const track = next.tracks.find(
    (t): t is Extract<Track, { kind: "audio" }> =>
      t.kind === "audio" && t.role === role
  );
  if (!track) return { doc, id: "" };
  const key = newMediaKey(next, media.kind);
  next.media[key] = media;
  const id = newId(next, media.kind);
  const wanted = Math.max(docDuration(next) - start, DEFAULTS.text);
  const duration = Math.max(
    MIN_ITEM_MS,
    Math.min(wanted, media.durationMs ?? wanted)
  );
  const item: AudioItem = {
    id,
    type: "audio",
    media: key,
    in: 0,
    start,
    duration,
    volume: 1,
    fadeIn: Math.min(400, duration / 2),
    fadeOut: Math.min(1200, duration / 2),
  };
  track.items.push(item);
  track.items.sort((a, b) => a.start - b.start);
  return { doc: next, id };
}

/** A text card at a time. */
export function addText(
  doc: TimelineDoc,
  start: number,
  text = "A title",
  preset: TextItem["style"]["preset"] = "title"
): { doc: TimelineDoc; id: string } {
  const next = clone(doc);
  const track = next.tracks.find((t) => t.kind === "text");
  if (!track || track.kind !== "text") return { doc, id: "" };
  const id = newId(next, "text");
  track.items.push({
    id,
    type: "text",
    text,
    start: Math.max(0, start),
    duration: DEFAULTS.text,
    fadeIn: 300,
    fadeOut: 300,
    style: { preset },
  });
  track.items.sort((a, b) => a.start - b.start);
  return { doc: next, id };
}

/** Moves a main-track item to another place in the order; the track closes up around it. */
export function moveMain(
  doc: TimelineDoc,
  id: string,
  toIndex: number
): TimelineDoc {
  const next = clone(doc);
  const main = mainOf(next);
  const from = main?.items.findIndex((i) => i.id === id) ?? -1;
  if (!main || from < 0) return doc;
  const first = main.items[0].start;
  const opener = main.items[0];
  const [item] = main.items.splice(from, 1);
  const to = Math.max(0, Math.min(toIndex, main.items.length));
  main.items.splice(to, 0, item);
  // the old opening shot had no way in; no longer first, it crossfades in like the rest
  if (main.items[0] !== opener && !opener.transitionIn)
    opener.transitionIn = { kind: "crossfade", duration: DEFAULTS.crossfade };
  main.items[0].start = first;
  return packMain(next);
}

/** Moves a text or audio item to a time. */
export function moveFree(
  doc: TimelineDoc,
  id: string,
  start: number
): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit || hit.track.kind === "main") return doc;
  hit.item.start = Math.max(0, Math.round(start));
  (hit.track.items as Item[]).sort((a, b) => a.start - b.start);
  return next;
}

/** Trims an item's start by `delta` ms (positive shortens it), keeping its end where it was. */
export function trimStart(
  doc: TimelineDoc,
  id: string,
  delta: number
): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit) return doc;
  const item = hit.item;
  let d = Math.round(delta);
  d = Math.min(d, item.duration - MIN_ITEM_MS);
  if (item.type === "video" || item.type === "audio") d = Math.max(d, -item.in);
  if (hit.track.kind !== "main") d = Math.max(d, -item.start);
  if (item.type === "video" || item.type === "audio") item.in += d;
  item.duration -= d;
  if (hit.track.kind === "main") {
    if (hit.index === 0) item.start = Math.max(0, item.start + d);
    return packMain(next);
  }
  item.start += d;
  return next;
}

/** Trims an item's end by `delta` ms (positive lengthens it), within what its source holds. */
export function trimEnd(
  doc: TimelineDoc,
  id: string,
  delta: number
): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit) return doc;
  const item = hit.item;
  const max = sourceLeft(next, item);
  item.duration = Math.max(
    MIN_ITEM_MS,
    Math.min(item.duration + Math.round(delta), max)
  );
  return hit.track.kind === "main" ? packMain(next) : next;
}

/** Splits an item in two at a time inside it; the second half picks up where the first ends. */
export function split(
  doc: TimelineDoc,
  id: string,
  at: number
): { doc: TimelineDoc; id: string | null } {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit) return { doc, id: null };
  const item = hit.item;
  const first = Math.round(at - item.start);
  if (first < MIN_ITEM_MS / 2 || item.duration - first < MIN_ITEM_MS / 2)
    return { doc, id: null };
  const rest = structuredClone(item) as Item;
  rest.id = newId(next, item.type === "video" ? "clip" : item.type);
  rest.start = item.start + first;
  rest.duration = item.duration - first;
  if (rest.type === "video" || rest.type === "audio") rest.in += first;
  // the cut between the halves is straight; the outer fades stay with the outer halves
  delete rest.fadeIn;
  if ("transitionIn" in rest) delete rest.transitionIn;
  delete item.fadeOut;
  item.duration = first;
  if (
    item.type === "image" &&
    item.motion &&
    rest.type === "image" &&
    rest.motion
  ) {
    const mid =
      item.motion.from +
      (item.motion.to - item.motion.from) * (first / (first + rest.duration));
    rest.motion = { from: mid, to: item.motion.to };
    item.motion = { from: item.motion.from, to: mid };
  }
  (hit.track.items as Item[]).splice(hit.index + 1, 0, rest);
  return {
    doc: hit.track.kind === "main" ? packMain(next) : next,
    id: rest.id,
  };
}

/** Removes an item; on the main track the rest close up. */
export function remove(doc: TimelineDoc, id: string): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit) return doc;
  const first =
    hit.track.kind === "main" && hit.index === 0 ? hit.item.start : null;
  (hit.track.items as Item[]).splice(hit.index, 1);
  if (hit.track.kind !== "main") return next;
  const main = mainOf(next);
  if (main?.items.length && first !== null) main.items[0].start = first;
  return packMain(next);
}

/** Turns the crossfade into a main-track item on or off. */
export function setCrossfade(
  doc: TimelineDoc,
  id: string,
  on: boolean
): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit || hit.track.kind !== "main" || hit.index === 0) return doc;
  const item = hit.item as VisualItem;
  if (on)
    item.transitionIn = { kind: "crossfade", duration: DEFAULTS.crossfade };
  else delete item.transitionIn;
  return packMain(next);
}

/** Changes an item's own settings: words and style, volume, fades, push. */
export function update(
  doc: TimelineDoc,
  id: string,
  patch: Partial<{
    text: string;
    preset: TextItem["style"]["preset"];
    volume: number;
    fadeIn: number;
    fadeOut: number;
    push: boolean;
  }>
): TimelineDoc {
  const next = clone(doc);
  const hit = findItem(next, id);
  if (!hit) return doc;
  const item = hit.item as Item & Record<string, unknown>;
  if (
    patch.text !== undefined &&
    (item.type === "text" || item.type === "image")
  ) {
    const words = patch.text.slice(0, 200);
    if (item.type === "text") item.text = words.trim() ? words : item.text;
    else if (words.trim()) item.text = words;
    else delete item.text;
  }
  if (patch.preset && item.type === "text")
    item.style = { ...item.style, preset: patch.preset };
  if (
    patch.volume !== undefined &&
    (item.type === "audio" || item.type === "video")
  )
    item.volume = Math.max(0, Math.min(1, patch.volume));
  const clampFade = (v: number) =>
    Math.max(0, Math.min(Math.round(v), item.duration));
  if (patch.fadeIn !== undefined) item.fadeIn = clampFade(patch.fadeIn);
  if (patch.fadeOut !== undefined) item.fadeOut = clampFade(patch.fadeOut);
  if (patch.push !== undefined && item.type === "image") {
    if (patch.push) item.motion = { from: 1, to: DEFAULTS.push };
    else delete item.motion;
  }
  return next;
}

/** The times an edit snaps to: the start, the playhead, and every item's edges. */
export function snapTargets(
  doc: TimelineDoc,
  playhead: number,
  except?: string
) {
  const out = new Set<number>([0, Math.round(playhead)]);
  for (const t of doc.tracks)
    for (const i of t.items as Item[]) {
      if (i.id === except) continue;
      out.add(i.start);
      out.add(endOf(i));
    }
  return [...out];
}

/** A time snapped to the nearest target within `threshold` ms, or to the frame grid. */
export function snap(
  ms: number,
  targets: number[],
  threshold: number,
  fps: number
) {
  let best = ms;
  let gap = threshold;
  for (const t of targets) {
    const d = Math.abs(t - ms);
    if (d <= gap) {
      gap = d;
      best = t;
    }
  }
  if (best !== ms) return best;
  const frame = 1000 / fps;
  return Math.max(0, Math.round(Math.round(ms / frame) * frame));
}
