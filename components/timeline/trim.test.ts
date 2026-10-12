import { describe, expect, it } from "vitest";
import { addToMain, findItem, MIN_ITEM_MS, trimEnd } from "@/lib/timeline/ops";
import { emptyDoc, type TimelineDoc } from "@/lib/timeline/schema";
import { clipRange, STILL_MS, setIn, setLength, setOut } from "./trim";

function doc() {
  let d = emptyDoc();
  d = addToMain(d, { url: "/a.mp4", kind: "video", durationMs: 6000 }).doc;
  d = addToMain(d, { url: "/b.jpg", kind: "image" }).doc;
  return d;
}
const ids = (d: TimelineDoc) => {
  const main = d.tracks.find((t) => t.kind === "main");
  if (main?.kind !== "main") throw new Error("no main");
  return main.items.map((i) => i.id);
};

describe("the trim sheet", () => {
  it("puts a clip's handles over its whole source", () => {
    const d = doc();
    const [clip] = ids(d);
    // a new clip runs the whole of its source
    expect(clipRange(d, clip)).toEqual({ source: 6000, from: 0, to: 6000 });
    expect(clipRange(d, ids(d)[1])).toBeNull();
  });

  it("moves the in-point and keeps the out-point", () => {
    const d = doc();
    const [clip] = ids(d);
    const next = setIn(d, clip, 1500);
    expect(clipRange(next, clip)).toEqual({
      source: 6000,
      from: 1500,
      to: 6000,
    });
    // the opening shot keeps its place: no gap opens before it
    expect(findItem(next, clip)?.item.start).toBe(
      findItem(d, clip)?.item.start
    );
    // never past the out-point less the shortest item
    expect(clipRange(setIn(d, clip, 5990), clip)?.from).toBe(
      6000 - MIN_ITEM_MS
    );
  });

  it("moves the out-point within the source", () => {
    const d = doc();
    const [clip] = ids(d);
    expect(clipRange(setOut(d, clip, 3000), clip)?.to).toBe(3000);
    expect(clipRange(setOut(d, clip, 9000), clip)?.to).toBe(6000);
  });

  it("sets a still's length between one and ten seconds", () => {
    const d = doc();
    const still = ids(d)[1];
    const len = (x: TimelineDoc) => findItem(x, still)?.item.duration;
    expect(len(setLength(d, still, 4200))).toBe(4200);
    expect(len(setLength(d, still, 200))).toBe(STILL_MS.min);
    expect(len(setLength(d, still, 60_000))).toBe(STILL_MS.max);
    // a clip is not a still
    expect(setLength(d, ids(d)[0], 4000)).toBe(d);
  });

  it("reads a source longer than its known length as at least what is used", () => {
    const d = doc();
    const [clip] = ids(d);
    const unknown = structuredClone(d);
    for (const m of Object.values(unknown.media)) delete m.durationMs;
    const longer = trimEnd(unknown, clip, 2000);
    expect(clipRange(longer, clip)).toEqual({
      source: 8000,
      from: 0,
      to: 8000,
    });
  });
});
