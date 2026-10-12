"use client";

import { canCut, collectCut } from "@/lib/cut";
import { fromCut } from "@/lib/timeline/from-cut";
import { emptyDoc, type TimelineDoc } from "@/lib/timeline/schema";
import { probeVideo } from "./export";

/**
 * A project's first cut (D-005 §17.5, TICKET-065): "Start a cut" lays out the template from a
 * run (the one asked for, or the latest that has something to cut), with each clip's real
 * length read from its file. A project with nothing to cut starts empty.
 */
type Message = { id: string; role: string; parts: unknown[] };

const MAX_EDGE = 1280;
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

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

/** The run a cut starts from: the one named, or the latest with something to cut. */
export function cuttableRun(messages: Message[], runId?: string | null) {
  const answers = messages
    .map((m, i) => ({ m, next: messages[i + 1] }))
    .filter(({ m, next }) => m.role === "user" && next?.role === "assistant");
  const ordered = runId
    ? answers.filter(({ m }) => m.id === runId)
    : [...answers].reverse();
  for (const { next } of ordered) {
    const pieces = collectCut(next.parts as never);
    if (canCut(pieces)) return pieces;
  }
  return null;
}

export async function startingCut(
  messages: Message[],
  runId?: string | null
): Promise<TimelineDoc> {
  const all = cuttableRun(messages, runId);
  if (!all) return emptyDoc();
  const pieces = { ...all, stills: all.stills.slice(0, 6) };
  const clips = await Promise.all(pieces.clips.map(probeVideo));
  const first =
    clips[0] ??
    (pieces.stills[0] ? await imageSize(pieces.stills[0].url) : null);
  return fromCut(
    pieces,
    clips.map((c) => c.durationMs),
    fitSize(first?.width ?? 1280, first?.height ?? 720)
  );
}
