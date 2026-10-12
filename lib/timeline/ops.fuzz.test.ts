import { describe, expect, it } from "vitest";
import { setIn, setLength, setOut } from "@/components/timeline/trim";
import { layersAt } from "./layout";
import {
  addAudio,
  addText,
  addToMain,
  MIN_ITEM_MS,
  moveFree,
  moveMain,
  remove,
  replaceMedia,
  setCrossfade,
  split,
  trimEnd,
  trimStart,
  update,
} from "./ops";
import {
  docDuration,
  emptyDoc,
  endOf,
  type Item,
  type Media,
  type TimelineDoc,
  timelineSchema,
} from "./schema";

/**
 * Editing in combination (TICKET-085): thousands of random sequences of the real edits, with the
 * rules a cut must always keep checked after every step. TICKET-084 (a short still swallowed by
 * the clip before it) was a rule no single-action test looked at; these look at all of them.
 * Seeded: a failure prints its seed and steps, and replays exactly.
 */

/** A small fast PRNG (mulberry32), so a seed replays the same sequence. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MEDIA: Media[] = [
  { url: "https://v3.fal.media/a.mp4", kind: "video", durationMs: 5000 },
  { url: "https://v3.fal.media/b.mp4", kind: "video", durationMs: 2400 },
  { url: "https://v3.fal.media/c.jpg", kind: "image" },
  { url: "https://v3.fal.media/d.jpg", kind: "image" },
  { url: "https://v3.fal.media/e.mp3", kind: "music", durationMs: 30000 },
  { url: "https://v3.fal.media/f.mp3", kind: "sound", durationMs: 1800 },
];

type Main = Extract<TimelineDoc["tracks"][number], { kind: "main" }>;
const mainOf = (d: TimelineDoc) =>
  d.tracks.find((t): t is Main => t.kind === "main");
const allItems = (d: TimelineDoc) => d.tracks.flatMap((t) => t.items as Item[]);

/** Every rule a cut must keep, whatever was done to it. */
function check(d: TimelineDoc) {
  const problems: string[] = [];
  const parsed = timelineSchema.safeParse(d);
  if (!parsed.success)
    problems.push(
      `the doc does not parse: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`
    );
  const ids = allItems(d).map((i) => i.id);
  if (new Set(ids).size !== ids.length) problems.push("an id is used twice");
  for (const item of allItems(d)) {
    if (item.duration < MIN_ITEM_MS)
      problems.push(`${item.id} is ${item.duration} ms, under the minimum`);
    if (item.start < 0) problems.push(`${item.id} starts before 0`);
    if ("media" in item) {
      const media = d.media[item.media];
      if (!media) problems.push(`${item.id} points at missing media`);
      else if (
        (item.type === "video" || item.type === "audio") &&
        media.durationMs !== undefined &&
        item.in + item.duration > media.durationMs + 1
      )
        problems.push(`${item.id} runs past its source`);
      if ((item.type === "video" || item.type === "audio") && item.in < 0)
        problems.push(`${item.id} starts before its source`);
    }
  }
  const main = mainOf(d)?.items ?? [];
  if (main[0]?.transitionIn) problems.push("the opening picture crossfades in");
  for (let i = 1; i < main.length; i++) {
    const prev = main[i - 1];
    const item = main[i];
    const overlap = endOf(prev) - item.start;
    const allowed = Math.min(
      item.transitionIn?.duration ?? 0,
      Math.floor(item.duration / 2),
      Math.floor(prev.duration / 2)
    );
    if (overlap !== allowed)
      problems.push(
        `${item.id} overlaps ${prev.id} by ${overlap}, not ${allowed}`
      );
    // TICKET-084: each picture has its own edges to grab
    if (!(item.start > prev.start))
      problems.push(`${item.id} starts with ${prev.id}`);
    if (!(endOf(item) > endOf(prev)))
      problems.push(`${item.id} ends inside ${prev.id}`);
  }
  const ends = d.tracks
    .filter((t) => t.kind !== "audio")
    .flatMap((t) => (t.items as Item[]).map(endOf));
  if (docDuration(d) !== Math.max(0, ...ends))
    problems.push("the length is off");
  const length = docDuration(d);
  for (let k = 0; k <= 6; k++) {
    const ms = Math.round((length * k) / 6);
    for (const layer of layersAt(d, ms))
      if (!(layer.alpha >= 0 && layer.alpha <= 1))
        problems.push(`a layer at ${ms} ms has alpha ${layer.alpha}`);
  }
  return problems;
}

/** One random real edit; its name, for the replay. */
function step(
  d: TimelineDoc,
  r: () => number
): { doc: TimelineDoc; name: string } {
  const pick = <T>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const items = allItems(d);
  const main = mainOf(d)?.items ?? [];
  const any = items.length ? pick(items) : null;
  const pic = main.length ? pick(main) : null;
  const ms = (max: number) => Math.round(r() * max);
  // positions as the UI gives them: the playhead and a drop point carry fractions
  const at = (max: number) => (r() < 0.5 ? r() * max : Math.round(r() * max));
  const len = Math.max(1000, docDuration(d));
  switch (Math.floor(r() * 16)) {
    case 0:
    case 1: {
      const m = pick(
        MEDIA.filter((x) => x.kind === "video" || x.kind === "image")
      );
      const at = r() < 0.5 ? undefined : Math.floor(r() * (main.length + 1));
      return {
        doc: addToMain(d, m, at).doc,
        name: `addToMain(${m.url.slice(-5)}, ${at})`,
      };
    }
    case 2: {
      const m = pick(
        MEDIA.filter((x) => x.kind === "music" || x.kind === "sound")
      );
      const t = at(len);
      return {
        doc: addAudio(d, m, t).doc,
        name: `addAudio(${m.url.slice(-5)}, ${t})`,
      };
    }
    case 3: {
      const t = at(len);
      return { doc: addText(d, t).doc, name: `addText(${t})` };
    }
    case 4:
      if (!pic) return { doc: d, name: "noop" };
      {
        const to = Math.floor(r() * main.length);
        return {
          doc: moveMain(d, pic.id, to),
          name: `moveMain(${pic.id}, ${to})`,
        };
      }
    case 5:
      if (!any || mainOf(d)?.items.some((i) => i.id === any.id))
        return { doc: d, name: "noop" };
      {
        const to = at(len);
        return {
          doc: moveFree(d, any.id, to),
          name: `moveFree(${any.id}, ${to})`,
        };
      }
    case 6:
      if (!any) return { doc: d, name: "noop" };
      {
        const delta = (r() - 0.5) * 2 * 6000;
        return {
          doc: trimStart(d, any.id, delta),
          name: `trimStart(${any.id}, ${delta})`,
        };
      }
    case 7:
    case 8:
      if (!any) return { doc: d, name: "noop" };
      {
        const delta = (r() - 0.6) * 2 * 6000;
        return {
          doc: trimEnd(d, any.id, delta),
          name: `trimEnd(${any.id}, ${delta})`,
        };
      }
    case 9:
      if (!any) return { doc: d, name: "noop" };
      {
        const t = any.start + at(any.duration);
        return { doc: split(d, any.id, t).doc, name: `split(${any.id}, ${t})` };
      }
    case 10:
      if (!any) return { doc: d, name: "noop" };
      return { doc: remove(d, any.id), name: `remove(${any.id})` };
    case 11:
      if (!pic) return { doc: d, name: "noop" };
      {
        const on = r() < 0.5;
        return {
          doc: setCrossfade(d, pic.id, on),
          name: `setCrossfade(${pic.id}, ${on})`,
        };
      }
    case 12:
      if (!any) return { doc: d, name: "noop" };
      {
        const patch = pick([
          { text: "Words" },
          { preset: "caption" as const },
          { volume: r() },
          { fadeIn: ms(3000) },
          { fadeOut: ms(3000) },
          { push: r() < 0.5 },
        ]);
        return {
          doc: update(d, any.id, patch),
          name: `update(${any.id}, ${JSON.stringify(patch)})`,
        };
      }
    case 13: {
      const clip = main.find((i) => i.type === "video");
      if (!clip) return { doc: d, name: "noop" };
      const v = at(5000);
      return r() < 0.5
        ? { doc: setIn(d, clip.id, v), name: `setIn(${clip.id}, ${v})` }
        : { doc: setOut(d, clip.id, v), name: `setOut(${clip.id}, ${v})` };
    }
    case 14: {
      const still = main.find((i) => i.type === "image");
      if (!still) return { doc: d, name: "noop" };
      const v = at(11000);
      return {
        doc: setLength(d, still.id, v),
        name: `setLength(${still.id}, ${v})`,
      };
    }
    default: {
      const from = pick(MEDIA.filter((x) => x.kind === "video"));
      const to: Media = {
        url: `https://v3.fal.media/take-${ms(1000)}.mp4`,
        kind: "video",
        durationMs: 1000 + ms(5000),
      };
      return {
        doc: replaceMedia(d, from.url, to),
        name: `replaceMedia(${from.url.slice(-5)} → ${to.durationMs} ms)`,
      };
    }
  }
}

describe("editing in combination (TICKET-085)", () => {
  it("keeps every rule through 2,000 random sequences of 40 edits", () => {
    const failures: string[] = [];
    for (let seed = 1; seed <= 2000 && failures.length < 5; seed++) {
      const r = rng(seed);
      let d = emptyDoc();
      const steps: string[] = [];
      for (let i = 0; i < 40; i++) {
        const before = JSON.stringify(d);
        const { doc, name } = step(d, r);
        steps.push(name);
        // an edit never changes the cut it was given (undo keeps the old one)
        if (JSON.stringify(d) !== before) {
          failures.push(
            `seed ${seed}: ${name} changed its input\n  ${steps.join("\n  ")}`
          );
          break;
        }
        d = doc;
        const problems = check(d);
        if (problems.length) {
          failures.push(
            `seed ${seed}, step ${i + 1}: ${problems.slice(0, 3).join("; ")}\n  ${steps.join("\n  ")}`
          );
          break;
        }
      }
    }
    expect(failures, failures.join("\n\n")).toEqual([]);
    // a few seconds alone; more beside the other suites
  }, 60_000);
});
