import { describe, expect, it } from "vitest";
import { alphaAt, CUT, canCut, collectCut, linesIn, planCut } from "./cut";
import { GUEST_EXAMPLES } from "./guest-examples";

const forest = GUEST_EXAMPLES.find(
  (e) => e.title === "A forest older than memory"
);
const parts = (forest?.messages[1].parts ?? []) as never[];

describe("collectCut", () => {
  it("reads a run's clip, poster, score and taglines", () => {
    const p = collectCut(parts);
    expect(p.clips).toEqual(["/landing/canyon.mp4"]);
    expect(p.stills.map((s) => s.url)).toEqual(["/landing/tree.jpg"]);
    expect(p.track).toEqual({ url: "/landing/score.mp3", kind: "music" });
    expect(p.lines).toEqual([
      "Older than every map.",
      "Walk in before the world wakes.",
      "The light still finds its way down.",
    ]);
    expect(canCut(p)).toBe(true);
  });

  it("needs motion: a lone still cannot be cut", () => {
    const whale = GUEST_EXAMPLES.find((e) => e.title.startsWith("A whale"));
    expect(
      canCut(collectCut((whale?.messages[1].parts ?? []) as never[]))
    ).toBe(false);
  });

  it("strips quotes and emphasis from numbered lines", () => {
    expect(linesIn('Intro\n1. "One."\n2) **Two**\n- three\n3. ‘Four’')).toEqual(
      ["One.", "Two", "Four"]
    );
  });
});

describe("planCut", () => {
  it("titles, clips and an end card, overlapping by the crossfade", () => {
    const { segments, duration } = planCut(collectCut(parts), [5]);
    expect(segments.map((s) => s.kind)).toEqual(["title", "clip", "still"]);
    const [title, clip, end] = segments;
    expect(title.text).toBe("Older than every map.");
    expect(clip.start).toBeCloseTo(CUT.title - CUT.crossfade);
    expect(end.start).toBeCloseTo(clip.end - CUT.crossfade);
    expect(end.text).toBe("Walk in before the world wakes.");
    expect(duration).toBeCloseTo(end.end);
    expect(duration).toBeCloseTo(1.3 + 5 - 0.5 + 3.2);
  });

  it("stills with a track make a slideshow ending on a line", () => {
    const { segments } = planCut(
      {
        clips: [],
        stills: [
          { url: "a.jpg", prompt: "" },
          { url: "b.jpg", prompt: "" },
        ],
        track: { url: "s.mp3", kind: "sound" },
        lines: [],
      },
      []
    );
    expect(segments.map((s) => s.kind)).toEqual(["still", "still"]);
    expect(segments[1].fadeOut).toBe(CUT.fadeOut);
  });
});

describe("alphaAt", () => {
  it("ramps in, holds and ramps out", () => {
    const s = {
      kind: "clip" as const,
      start: 1,
      end: 5,
      fadeIn: 0.5,
      fadeOut: 1,
    };
    expect(alphaAt(s, 0.9)).toBe(0);
    expect(alphaAt(s, 1.25)).toBeCloseTo(0.5);
    expect(alphaAt(s, 3)).toBe(1);
    expect(alphaAt(s, 4.5)).toBeCloseTo(0.5);
    expect(alphaAt(s, 5)).toBe(0);
  });
});
