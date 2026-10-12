import { describe, expect, it } from "vitest";
import { canCut, collectCut, linesIn } from "./cut";
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

  it("does not offer a cut of one clip and nothing else", () => {
    expect(
      canCut({ clips: ["/a.mp4"], stills: [], track: null, lines: [] } as never)
    ).toBe(false);
    expect(
      canCut({
        clips: ["/a.mp4"],
        stills: [],
        track: { url: "/a.mp3", kind: "music" },
        lines: [],
      } as never)
    ).toBe(true);
  });

  it("strips quotes and emphasis from numbered lines", () => {
    expect(linesIn('Intro\n1. "One."\n2) **Two**\n- three\n3. ‘Four’')).toEqual(
      ["One.", "Two", "Four"]
    );
  });
});
