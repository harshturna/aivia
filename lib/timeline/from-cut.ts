import type { CutPieces } from "@/lib/cut";
import {
  type AudioItem,
  docDuration,
  emptyDoc,
  type Media,
  type TextItem,
  type TimelineDoc,
  type VisualItem,
} from "./schema";

/**
 * "Cut it together" as a timeline (TICKET-061): today's template laid out as items you can
 * then edit. With clips: a title card on the first line, the clips back to back with short
 * crossfades, an end card on the first still with the next line and a slow push-in. Stills
 * alone: a slow-zoom slideshow, the last with a line. The score runs under it all, faded in
 * and out. The numbers are the template's (`CUT` in lib/cut.ts), in milliseconds.
 */
export const TEMPLATE = {
  fps: 24,
  title: 1800,
  titleFadeIn: 400,
  crossfade: 500,
  endCard: 3200,
  still: 3000,
  fadeOut: 600,
  firstStillFadeIn: 400,
  push: 1.06,
  scoreFadeIn: 400,
  scoreFadeOut: 1600,
} as const;

export function fromCut(
  pieces: CutPieces,
  /** The clips' own lengths, read from the files. */
  clipMs: number[],
  size: { width: number; height: number }
): TimelineDoc {
  const T = TEMPLATE;
  const doc = emptyDoc(size.width, size.height);
  const media: Record<string, Media> = {};
  const text: TextItem[] = [];
  const main: VisualItem[] = [];
  const score: AudioItem[] = [];

  let t = 0;
  if (pieces.lines[0]) {
    text.push({
      id: "title",
      type: "text",
      text: pieces.lines[0],
      start: 0,
      duration: T.title,
      fadeIn: T.titleFadeIn,
      fadeOut: T.crossfade,
      style: { preset: "title" },
    });
    t = T.title - T.crossfade;
  }
  const endLine =
    pieces.lines[1] ??
    (pieces.lines[0] && !text.length ? pieces.lines[0] : undefined);

  if (pieces.clips.length) {
    pieces.clips.forEach((url, i) => {
      const key = `clip-${i}`;
      const duration = Math.max(500, Math.round(clipMs[i] ?? 5000));
      media[key] = { url, kind: "video", durationMs: duration };
      main.push({
        id: key,
        type: "video",
        media: key,
        in: 0,
        start: t,
        duration,
        volume: 0,
        // the first clip comes up out of the title card; each later one crossfades in
        ...(i === 0
          ? text.length
            ? { fadeIn: T.crossfade }
            : {}
          : { transitionIn: { kind: "crossfade", duration: T.crossfade } }),
      } as VisualItem);
      t += duration - T.crossfade;
    });
    const poster = pieces.stills[0];
    if (poster) {
      media.poster = { url: poster.url, kind: "image" };
      main.push({
        id: "end-card",
        type: "image",
        media: "poster",
        start: t,
        duration: T.endCard,
        fadeOut: T.fadeOut,
        transitionIn: { kind: "crossfade", duration: T.crossfade },
        motion: { from: 1, to: T.push },
        ...(endLine ? { text: endLine } : {}),
      });
    } else {
      const last = main[main.length - 1];
      last.fadeOut = T.fadeOut;
    }
  } else {
    const stills = pieces.stills.slice(0, 6);
    stills.forEach((s, i) => {
      const key = `still-${i}`;
      const last = i === stills.length - 1;
      media[key] = { url: s.url, kind: "image" };
      main.push({
        id: key,
        type: "image",
        media: key,
        start: t,
        duration: T.still,
        ...(i === 0
          ? { fadeIn: text.length ? T.crossfade : T.firstStillFadeIn }
          : { transitionIn: { kind: "crossfade", duration: T.crossfade } }),
        ...(last ? { fadeOut: T.fadeOut } : {}),
        motion: i % 2 ? { from: T.push, to: 1 } : { from: 1, to: T.push },
        ...(last && endLine ? { text: endLine } : {}),
      } as VisualItem);
      t += T.still - T.crossfade;
    });
  }

  doc.media = media;
  doc.tracks = doc.tracks.map((track) =>
    track.kind === "text"
      ? { ...track, items: text }
      : track.kind === "main"
        ? { ...track, items: main }
        : track
  );

  const length = docDuration(doc);
  if (pieces.track && length > 0) {
    doc.media.score = { url: pieces.track.url, kind: pieces.track.kind };
    score.push({
      id: "score",
      type: "audio",
      media: "score",
      in: 0,
      start: 0,
      duration: length,
      volume: 1,
      fadeIn: Math.min(T.scoreFadeIn, length),
      // held until 1.6 s from the end (never before 0.5 s), then down to silence
      fadeOut: Math.max(0, length - Math.max(500, length - T.scoreFadeOut)),
    });
    const role = pieces.track.kind === "music" ? "score" : "sound";
    doc.tracks = doc.tracks.map((track) =>
      track.kind === "audio" && track.role === role
        ? { ...track, items: score }
        : track
    );
  }
  return doc;
}
