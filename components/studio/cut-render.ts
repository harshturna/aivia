import {
  probeVideo,
  type Rendered,
  renderTimeline,
} from "@/components/timeline/export";
import type { CutPieces } from "@/lib/cut";
import { fromCut } from "@/lib/timeline/from-cut";

/**
 * "Cut it together" (TICKET-040), now a timeline (TICKET-061): the run's pieces laid out by
 * the template as a TimelineDoc, then rendered by the same export the editor will use.
 */
export type { Rendered };

const MAX_EDGE = 1280;

function even(n: number) {
  return Math.max(2, Math.round(n / 2) * 2);
}

/** The frame: the first clip's shape (or the first still's), at most 1280 on the long edge. */
function fitSize(w: number, h: number) {
  const s = Math.min(1, MAX_EDGE / Math.max(w, h));
  return { width: even(w * s), height: even(h * s) };
}

function imageSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 1280, height: 720 });
    img.src = url;
  });
}

export async function renderCut(
  all: CutPieces,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<Rendered> {
  // the stills it draws are the stills it plans: six at most (TICKET-043)
  const pieces = { ...all, stills: all.stills.slice(0, 6) };
  const clips = await Promise.all(pieces.clips.map(probeVideo));
  const first =
    clips[0] ??
    (pieces.stills[0] ? await imageSize(pieces.stills[0].url) : null);
  const size = fitSize(first?.width ?? 1280, first?.height ?? 720);
  const doc = fromCut(
    pieces,
    clips.map((c) => c.durationMs),
    size
  );
  return renderTimeline(doc, onProgress, signal);
}
