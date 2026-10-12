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
/** A cut needs motion and something to cut it with: a lone clip is already a clip. */
export function canCut(p: CutPieces) {
  const pieces =
    p.clips.length +
    p.stills.length +
    (p.track ? 1 : 0) +
    (p.lines.length ? 1 : 0);
  return (
    (p.clips.length > 0 && pieces >= 2) ||
    (p.stills.length > 0 && p.track !== null)
  );
}
