import { describe, expect, it } from "vitest";
import type { CutPieces } from "@/lib/cut";
import { fromCut, TEMPLATE } from "./from-cut";
import { alphaOf, gainEnvelope, layersAt } from "./layout";
import { migrate } from "./migrate";
import {
  docDuration,
  emptyDoc,
  TIMELINE_VERSION,
  timelineSchema,
} from "./schema";

const forest: CutPieces = {
  clips: ["https://v3.fal.media/files/canyon.mp4"],
  stills: [
    { url: "https://v3.fal.media/files/tree.jpg", prompt: "an ancient tree" },
  ],
  track: { url: "https://v3.fal.media/files/score.mp3", kind: "music" },
  lines: ["Older than every map.", "Walk in before the world wakes."],
};
const size = { width: 960, height: 528 };

describe("the timeline document", () => {
  it("parses what it builds and rejects what it is not", () => {
    const doc = fromCut(forest, [5042], size);
    expect(timelineSchema.safeParse(doc).success).toBe(true);
    expect(timelineSchema.safeParse({ ...doc, fps: 25 }).success).toBe(false);
    expect(
      timelineSchema.safeParse({
        ...doc,
        tracks: [{ id: "x", kind: "main", items: [{ id: "a" }] }],
      }).success
    ).toBe(false);
  });

  it("measures an empty cut as nothing", () => {
    expect(docDuration(emptyDoc())).toBe(0);
  });
});

describe("migrate", () => {
  it("loads a current cut", () => {
    const r = migrate(fromCut(forest, [5042], size));
    expect(r.ok && !r.readOnly && r.doc?.version).toBe(TIMELINE_VERSION);
  });
  it("opens a cut from newer code read-only", () => {
    const r = migrate({ ...emptyDoc(), version: TIMELINE_VERSION + 1 });
    expect(r).toMatchObject({ ok: true, readOnly: true, doc: null });
  });
  it("refuses something that is not a cut", () => {
    expect(migrate({ hello: "world" }).ok).toBe(false);
    expect(migrate(null).ok).toBe(false);
  });
});

describe("fromCut", () => {
  it("lays a run out as the template: title, clip, end card", () => {
    const doc = fromCut(forest, [5042], size);
    const text = doc.tracks.find((t) => t.kind === "text");
    const main = doc.tracks.find((t) => t.kind === "main");
    expect(text?.items.map((i) => [i.start, i.duration])).toEqual([[0, 1800]]);
    expect(main?.items.map((i) => [i.start, i.duration])).toEqual([
      [1300, 5042],
      [5842, 3200],
    ]);
    expect(docDuration(doc)).toBe(9042);
  });

  it("lays the score under the whole cut, faded as the old mix was", () => {
    const doc = fromCut(forest, [5042], size);
    const length = docDuration(doc);
    const score = doc.tracks.find(
      (t) => t.kind === "audio" && t.role === "score"
    );
    const item = score?.kind === "audio" ? score.items[0] : undefined;
    expect(item).toBeDefined();
    if (!item) return;
    expect(gainEnvelope(item)).toEqual([
      [0, 0],
      [TEMPLATE.scoreFadeIn, 1],
      [length - TEMPLATE.scoreFadeOut, 1],
      [length, 0],
    ]);
  });

  it("puts the end card's line on the poster and pushes in", () => {
    const doc = fromCut(forest, [5042], size);
    const main = doc.tracks.find((t) => t.kind === "main");
    const card = main?.kind === "main" ? main.items.at(-1) : undefined;
    expect(card).toMatchObject({
      type: "image",
      text: forest.lines[1],
      motion: { from: 1, to: 1.06 },
    });
  });
});

describe("layersAt", () => {
  it("reads a clip's source time from its in-point", () => {
    const doc = fromCut(forest, [5042], size);
    const main = doc.tracks.find((t) => t.kind === "main");
    if (main?.kind !== "main") throw new Error("no main track");
    main.items[0] = {
      ...main.items[0],
      in: 1000,
    } as (typeof main.items)[number];
    const clip = layersAt(doc, main.items[0].start + 500).find(
      (l) => l.kind === "video"
    );
    expect(clip?.kind === "video" && clip.sourceMs).toBe(1500);
  });
});

describe("alphaOf", () => {
  it("ramps in, holds and ramps out, and is nothing outside the item", () => {
    const item = { start: 1000, duration: 1000 };
    expect(alphaOf(item, 500, 500, 900)).toBe(0);
    expect(alphaOf(item, 500, 500, 1250)).toBeCloseTo(0.5);
    expect(alphaOf(item, 500, 500, 1500)).toBe(1);
    expect(alphaOf(item, 500, 500, 1750)).toBeCloseTo(0.5);
    expect(alphaOf(item, 500, 500, 2000)).toBe(0);
  });
});
