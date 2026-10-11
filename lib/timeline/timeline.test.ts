import { describe, expect, it } from "vitest";
import { alphaAt, type CutPieces, planCut } from "@/lib/cut";
import { fromCut, TEMPLATE } from "./from-cut";
import { gainEnvelope, layersAt } from "./layout";
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

/** The new layout must time a cut exactly as the old planner did. */
function sameTimingAsPlanCut(pieces: CutPieces, clipSeconds: number[]) {
  const doc = fromCut(
    pieces,
    clipSeconds.map((s) => s * 1000),
    size
  );
  const { segments, duration } = planCut(pieces, clipSeconds);
  expect(docDuration(doc)).toBe(Math.round(duration * 1000));
  // sample every 1/24 s: the same pictures at the same opacities
  for (let f = 0; f <= Math.ceil(duration * 24); f++) {
    const t = f / 24;
    const ms = Math.round(t * 1000);
    const layers = layersAt(doc, ms);
    for (const s of segments) {
      const old = alphaAt(s, t);
      const match = layers.find((l) =>
        s.kind === "title"
          ? l.kind === "text"
          : s.kind === "clip"
            ? l.kind === "video" && l.item.id === `clip-${s.clip}`
            : l.kind === "image" && doc.media[l.item.media].url === s.src
      );
      expect(match?.alpha ?? 0, `${s.kind} at ${t.toFixed(3)} s`).toBeCloseTo(
        old,
        1
      );
    }
  }
}

describe("fromCut", () => {
  it("times a run with a clip, a poster, a score and lines as planCut did", () => {
    sameTimingAsPlanCut(forest, [5.042]);
  });
  it("times several clips without a poster as planCut did", () => {
    sameTimingAsPlanCut(
      {
        ...forest,
        clips: [...forest.clips, "https://v3.fal.media/b.mp4"],
        stills: [],
      },
      [5, 4]
    );
  });
  it("times a stills slideshow as planCut did", () => {
    const stills = [1, 2, 3].map((i) => ({
      url: `https://v3.fal.media/s${i}.jpg`,
      prompt: "",
    }));
    sameTimingAsPlanCut({ ...forest, clips: [], stills }, []);
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
