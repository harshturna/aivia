import { describe, expect, it } from "vitest";
import { fromCut } from "./from-cut";
import {
  addAudio,
  addText,
  addToMain,
  findItem,
  MIN_ITEM_MS,
  moveFree,
  moveMain,
  remove,
  setCrossfade,
  snap,
  snapTargets,
  split,
  trimEnd,
  trimStart,
  update,
} from "./ops";
import {
  docDuration,
  emptyDoc,
  endOf,
  type TimelineDoc,
  timelineSchema,
} from "./schema";

const clip = (url: string, ms = 5000) => ({
  url,
  kind: "video" as const,
  durationMs: ms,
});
const still = (url: string) => ({ url, kind: "image" as const });
const main = (doc: TimelineDoc) => {
  const t = doc.tracks.find((x) => x.kind === "main");
  if (t?.kind !== "main") throw new Error("no main");
  return t.items;
};
/** Main-track items are end to end, less each crossfade, and the doc stays valid. */
function packed(doc: TimelineDoc) {
  expect(timelineSchema.safeParse(doc).success).toBe(true);
  const items = main(doc);
  for (let i = 1; i < items.length; i++)
    expect(items[i].start).toBe(
      endOf(items[i - 1]) - (items[i].transitionIn?.duration ?? 0)
    );
}
function three() {
  let d = emptyDoc();
  for (const m of [clip("/a.mp4"), clip("/b.mp4", 4000), still("/c.jpg")])
    d = addToMain(d, m).doc;
  return d;
}

describe("adding", () => {
  it("lays pieces end to end with crossfades after the first", () => {
    const d = three();
    packed(d);
    expect(main(d).map((i) => [i.start, i.duration])).toEqual([
      [0, 5000],
      [4500, 4000],
      [8000, 3000],
    ]);
    expect(main(d)[0].transitionIn).toBeUndefined();
  });
  it("inserts at an index and closes up behind it", () => {
    const d = addToMain(three(), still("/x.jpg"), 1).doc;
    packed(d);
    expect(main(d).map((i) => d.media[i.media].url)).toEqual([
      "/a.mp4",
      "/x.jpg",
      "/b.mp4",
      "/c.jpg",
    ]);
  });
  it("lays a score under the cut and a card where it is put", () => {
    let d = three();
    d = addAudio(d, { url: "/s.mp3", kind: "music", durationMs: 30000 }).doc;
    const score = d.tracks.find(
      (t) => t.kind === "audio" && t.role === "score"
    );
    expect(score?.items[0]).toMatchObject({
      start: 0,
      duration: docDuration(d),
    });
    const r = addText(d, 1000, "Hello");
    expect(findItem(r.doc, r.id)?.item).toMatchObject({
      start: 1000,
      text: "Hello",
    });
  });
});

describe("moving", () => {
  it("reorders the main track and keeps it packed", () => {
    const d = moveMain(three(), main(three())[2].id, 0);
    packed(d);
    expect(main(d).map((i) => d.media[i.media].url)).toEqual([
      "/c.jpg",
      "/a.mp4",
      "/b.mp4",
    ]);
    // the old opener now crossfades in
    expect(main(d)[1].transitionIn?.duration).toBe(500);
  });
  it("keeps the first shot's start (after a title card) when the order changes", () => {
    const f = fromCut(
      {
        clips: ["/a.mp4", "/b.mp4"],
        stills: [],
        track: null,
        lines: ["Title"],
      },
      [5000, 5000],
      { width: 1280, height: 720 }
    );
    const opening = main(f)[0].start;
    const d = moveMain(f, main(f)[1].id, 0);
    expect(main(d)[0].start).toBe(opening);
    packed(d);
  });
  it("moves text and audio freely, never before zero", () => {
    const r = addText(three(), 2000);
    expect(findItem(moveFree(r.doc, r.id, 3500), r.id)?.item.start).toBe(3500);
    expect(findItem(moveFree(r.doc, r.id, -40), r.id)?.item.start).toBe(0);
  });
});

describe("trimming", () => {
  it("trims a clip's start into its source and keeps the track packed", () => {
    const d = trimStart(three(), main(three())[1].id, 1000);
    const b = main(d)[1];
    expect(b).toMatchObject({ in: 1000, duration: 3000 });
    packed(d);
  });
  it("never trims past the source, nor below the minimum", () => {
    const id = main(three())[0].id;
    expect(main(trimEnd(three(), id, 99999))[0].duration).toBe(5000);
    expect(main(trimStart(three(), id, -500))[0]).toMatchObject({
      in: 0,
      duration: 5000,
    });
    expect(main(trimEnd(three(), id, -99999))[0].duration).toBe(MIN_ITEM_MS);
  });
  it("lengthens a still freely", () => {
    const id = main(three())[2].id;
    expect(main(trimEnd(three(), id, 2000))[2].duration).toBe(5000);
  });
});

describe("splitting and removing", () => {
  it("splits a clip so the second half picks up where the first ends", () => {
    const id = main(three())[0].id;
    const r = split(three(), id, 2000);
    const [a, b] = main(r.doc);
    expect([a.duration, b.duration]).toEqual([2000, 3000]);
    expect(b.type === "video" && b.in).toBe(2000);
    expect(b.transitionIn).toBeUndefined();
    packed(r.doc);
  });
  it("refuses a split at the very edge", () => {
    expect(split(three(), main(three())[0].id, 20).id).toBeNull();
  });
  it("removes an item and closes the gap", () => {
    const d = remove(three(), main(three())[1].id);
    packed(d);
    expect(main(d).map((i) => d.media[i.media].url)).toEqual([
      "/a.mp4",
      "/c.jpg",
    ]);
  });
});

describe("settings", () => {
  it("turns a crossfade off into a straight cut", () => {
    const id = main(three())[1].id;
    const d = setCrossfade(three(), id, false);
    expect(main(d)[1].start).toBe(5000);
    packed(d);
  });
  it("edits a card's words and style, an audio item's volume and fades", () => {
    const t = addText(three(), 0, "A");
    const d = update(t.doc, t.id, {
      text: "Older than every map.",
      preset: "caption",
      fadeIn: 99999,
    });
    expect(findItem(d, t.id)?.item).toMatchObject({
      text: "Older than every map.",
      style: { preset: "caption" },
      fadeIn: 2000,
    });
    expect(
      findItem(update(t.doc, t.id, { text: "  " }), t.id)?.item
    ).toMatchObject({ text: "A" });
  });
});

describe("snapping", () => {
  it("snaps to an edge within the threshold, else to the frame grid", () => {
    const targets = snapTargets(three(), 7000);
    expect(snap(4480, targets, 40, 24)).toBe(4500);
    expect(snap(6990, targets, 40, 24)).toBe(7000);
    expect(snap(6100, targets, 40, 24)).toBe(
      Math.round(Math.round(6100 / (1000 / 24)) * (1000 / 24))
    );
  });
});
