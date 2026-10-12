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
  replaceMedia,
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

  it("puts a second card after the one already showing there (TICKET-085)", () => {
    const a = addText(three(), 1000);
    const b = addText(a.doc, 1500);
    const first = findItem(b.doc, a.id)?.item;
    expect(findItem(b.doc, b.id)?.item.start).toBe(
      (first?.start ?? 0) + (first?.duration ?? 0)
    );
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

describe("a new take", () => {
  it("swaps the piece in place, keeping the length the new source allows", () => {
    let d = three();
    d = trimStart(d, main(d)[0].id, 1000);
    const before = main(d).map((i) => i.duration);
    const next = replaceMedia(d, "/a.mp4", clip("/a2.mp4", 3000));
    packed(next);
    const first = main(next)[0];
    expect(next.media[first.media].url).toBe("/a2.mp4");
    expect(first.type === "video" && first.in).toBe(0);
    // 4 s was used; the new clip has 3 s
    expect(first.duration).toBe(3000);
    expect(
      main(next)
        .slice(1)
        .map((i) => i.duration)
    ).toEqual(before.slice(1));
    expect(Object.values(next.media).some((m) => m.url === "/a.mp4")).toBe(
      false
    );
    expect(replaceMedia(d, "/nowhere.mp4", clip("/x.mp4"))).toBe(d);
  });
});

describe("a short piece after a crossfade (TICKET-084)", () => {
  it("never sits wholly inside its neighbour, so both keep their own ends", () => {
    let d = emptyDoc();
    d = addToMain(d, clip("/a.mp4", 5000)).doc;
    d = addToMain(d, still("/b.jpg")).doc;
    // the still trimmed to 800 ms; the crossfade asks for 500, half the still is 400
    d = trimEnd(d, main(d)[1].id, 800 - main(d)[1].duration);
    const [a, b] = main(d);
    expect(b.duration).toBe(800);
    // the overlap is at most half the still, so the still ends after the clip does
    expect(a.start + a.duration - b.start).toBe(400);
    expect(b.start + b.duration).toBeGreaterThan(a.start + a.duration);
  });
});

describe("the cut's opening and end (TICKET-087)", () => {
  /** Three pieces after a title card, the first shot held back under the card. */
  function titled() {
    const card = addText(three(), 0);
    const d = structuredClone(card.doc);
    main(d)[0].start = 1300;
    return { doc: moveFree(d, card.id, 0), card: card.id };
  }

  it("keeps black before the first shot only while a card plays over it", () => {
    const { doc, card } = titled();
    expect(main(doc)[0].start).toBe(1300);
    const gone = remove(doc, card);
    expect(main(gone)[0].start).toBe(0);
    packed(gone);
    const moved = moveFree(doc, card, 3000);
    expect(main(moved)[0].start).toBe(0);
  });

  it("never puts a new card past the end of the film", () => {
    const d = three();
    const r = addText(d, docDuration(d) + 2000);
    expect(endOf(findItem(r.doc, r.id)?.item ?? main(d)[0])).toBe(
      docDuration(d)
    );
    expect(docDuration(r.doc)).toBe(docDuration(d));
  });

  it("runs a score to the cut's new end as pictures are added", () => {
    const d = addAudio(three(), {
      url: "/s.mp3",
      kind: "music",
      durationMs: 60000,
    }).doc;
    const grown = addToMain(d, clip("/d.mp4")).doc;
    const score = grown.tracks.find(
      (t) => t.kind === "audio" && t.role === "score"
    );
    expect(score?.items[0] && endOf(score.items[0])).toBe(docDuration(grown));
    // but no further than the music goes
    const short = addAudio(three(), {
      url: "/t.mp3",
      kind: "music",
      durationMs: docDuration(three()) + 500,
    }).doc;
    const capped = addToMain(short, clip("/d.mp4")).doc;
    const music = capped.tracks.find(
      (t) => t.kind === "audio" && t.role === "score"
    )?.items[0];
    expect(music?.duration).toBe(docDuration(three()) + 500);
  });

  it("keeps fades within a piece trimmed short", () => {
    let d = addAudio(three(), {
      url: "/s.mp3",
      kind: "music",
      durationMs: 60000,
    }).doc;
    const score = d.tracks.find((t) => t.kind === "audio")?.items[0];
    if (!score) throw new Error("no score");
    d = update(d, score.id, { fadeIn: 900, fadeOut: 4100 });
    d = trimEnd(d, score.id, 1000 - score.duration);
    const after = findItem(d, score.id)?.item;
    expect(after?.duration).toBe(1000);
    expect(after && "fadeOut" in after && after.fadeOut).toBe(1000);
    expect(after && "fadeIn" in after && after.fadeIn).toBe(900);
  });
});
