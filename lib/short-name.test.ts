import { describe, expect, it } from "vitest";
import { shortName } from "./short-name";

describe("a piece's short name", () => {
  it.each([
    [
      "A tall waterfall pouring into an emerald pool in a mossy canyon, mist rising",
      "Tall waterfall",
    ],
    [
      "A vertical poster: one colossal ancient tree alone on a green hill above a sea of mist",
      "Colossal ancient tree",
    ],
    [
      "Slow ambient strings with a soft choir, distant bells and harp",
      "Slow ambient strings",
    ],
    [
      "A snowy owl gliding low over a frozen lake at dawn, wings spread wide",
      "Snowy owl",
    ],
    [
      "Green and violet aurora rippling over a still fjord at night",
      "Green and violet aurora",
    ],
    ["A dawn chorus in an old forest, songbirds near and far", "Dawn chorus"],
    [
      "Macro photograph of a single dew drop on a fern frond",
      "Single dew drop",
    ],
    [
      "A storybook illustration in gouache: a giant whale swimming through soft clouds",
      "Giant whale",
    ],
    ["Bring this to life", "Bring this to life"],
  ])("%s → %s", (prompt, name) => {
    expect(shortName(prompt)).toBe(name);
  });

  it("falls back when there is nothing to name", () => {
    expect(shortName("")).toBe("Untitled");
    expect(shortName("  ", "Clip")).toBe("Clip");
  });
});
