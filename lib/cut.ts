/**
 * Cutting a run into one piece (TICKET-040): which of a run's outputs go into the cut, and
 * the plan of the cut in time. Pure, so it is tested here; `components/studio/cut-render.ts`
 * draws and encodes it in the browser.
 */

type Part = {
  type: string;
  state?: string;
  text?: string;
  output?: { url?: string; urls?: string[]; prompt?: string };
};

export type CutPieces = {
  clips: string[];
  stills: Array<{ url: string; prompt: string }>;
  track: { url: string; kind: "music" | "sound" } | null;
  lines: string[];
};

/** The taglines a run wrote: its numbered lines, without quotes or emphasis, at most three. */
export function linesIn(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const m = raw.match(/^\s*\d+[.)]\s+(.+)$/);
    if (!m) continue;
    const line = m[1]
      .replace(/\*\*|__/g, "")
      .replace(/^["“'‘]+|["”'’]+$/g, "")
      .trim();
    if (line) out.push(line);
    if (out.length === 3) break;
  }
  return out;
}

/** The pieces of a finished run: its clips, its stills, its track (music first), its lines. */
export function collectCut(parts: ReadonlyArray<Part>): CutPieces {
  const pieces: CutPieces = { clips: [], stills: [], track: null, lines: [] };
  let sound: CutPieces["track"] = null;
  const notes: string[] = [];
  for (const p of parts) {
    if (p.type === "text" && p.text) notes.push(p.text);
    if (!p.type.startsWith("tool-") || p.state !== "output-available") continue;
    const o = p.output ?? {};
    const tool = p.type.slice(5);
    if (tool === "generate_video" && o.url) pieces.clips.push(o.url);
    if (tool === "generate_image")
      for (const url of o.urls ?? (o.url ? [o.url] : []))
        pieces.stills.push({ url, prompt: o.prompt ?? "" });
    if (tool === "generate_music" && o.url && !pieces.track)
      pieces.track = { url: o.url, kind: "music" };
    if (tool === "generate_sound_effect" && o.url && !sound)
      sound = { url: o.url, kind: "sound" };
  }
  pieces.track ??= sound;
  pieces.lines = linesIn(notes.join("\n"));
  return pieces;
}

/** A cut needs motion: a clip, or stills with a track to carry them. */
export function canCut(p: CutPieces) {
  return p.clips.length > 0 || (p.stills.length > 0 && p.track !== null);
}

export type Segment = {
  kind: "title" | "clip" | "still";
  start: number;
  end: number;
  fadeIn: number;
  fadeOut: number;
  src?: string;
  clip?: number;
  text?: string;
  zoom?: [number, number];
};

export const CUT = {
  fps: 24,
  title: 1.8,
  crossfade: 0.5,
  endCard: 3.2,
  still: 3,
  fadeOut: 0.6,
} as const;

/**
 * The cut in time. With clips: a title card on the first line, the clips back to back with
 * short crossfades, an end card on the first still with the next line and a slow push-in,
 * then black. Stills alone: a slow-zoom slideshow, the last with a line. `clipSeconds` are
 * the clips' own lengths, read from the files.
 */
export function planCut(p: CutPieces, clipSeconds: number[]) {
  const { title, crossfade: x, endCard, still, fadeOut } = CUT;
  const segments: Segment[] = [];
  let t = 0;
  if (p.lines[0]) {
    segments.push({
      kind: "title",
      text: p.lines[0],
      start: 0,
      end: title,
      fadeIn: 0.4,
      fadeOut: x,
    });
    t = title - x;
  }
  const endLine =
    p.lines[1] ?? (p.lines[0] && !segments.length ? p.lines[0] : undefined);
  if (p.clips.length) {
    p.clips.forEach((src, i) => {
      const d = Math.max(0.5, clipSeconds[i] ?? 5);
      segments.push({
        kind: "clip",
        src,
        clip: i,
        start: t,
        end: t + d,
        fadeIn: segments.length ? x : 0,
        fadeOut: x,
      });
      t += d - x;
    });
    const poster = p.stills[0];
    if (poster) {
      segments.push({
        kind: "still",
        src: poster.url,
        text: endLine,
        start: t,
        end: t + endCard,
        fadeIn: x,
        fadeOut,
        zoom: [1, 1.06],
      });
    } else segments[segments.length - 1].fadeOut = fadeOut;
  } else {
    p.stills.forEach((s, i) => {
      const last = i === p.stills.length - 1;
      segments.push({
        kind: "still",
        src: s.url,
        text: last ? endLine : undefined,
        start: t,
        end: t + still,
        fadeIn: segments.length ? x : 0.4,
        fadeOut: last ? fadeOut : x,
        zoom: i % 2 ? [1.06, 1] : [1, 1.06],
      });
      t += still - x;
    });
  }
  const duration = segments.length ? segments[segments.length - 1].end : 0;
  return { segments, duration };
}

/** How much of a segment shows at time t: 0 outside it, ramping in and out at its edges. */
export function alphaAt(s: Segment, t: number) {
  if (t < s.start || t >= s.end) return 0;
  const a = s.fadeIn > 0 ? (t - s.start) / s.fadeIn : 1;
  const b = s.fadeOut > 0 ? (s.end - t) / s.fadeOut : 1;
  return Math.max(0, Math.min(1, a, b));
}
