import { describe, expect, it } from "vitest";
import { cloudinaryOptions, isEditTool, isReady, targetSize } from "./edit";

describe("isReady", () => {
  it("needs an object and a colour to recolor, an object to remove", () => {
    expect(isReady({ tool: "recolor", object: "the car" })).toBe(false);
    expect(isReady({ tool: "recolor", object: "the car", color: "red" })).toBe(
      true
    );
    expect(isReady({ tool: "remove", object: " " })).toBe(false);
    expect(isReady({ tool: "restore" })).toBe(true);
  });
});

describe("targetSize", () => {
  it("keeps the source size except for a fill", () => {
    expect(
      targetSize({ tool: "restore" }, { width: 800, height: 600 })
    ).toEqual({ width: 800, height: 600 });
  });
  it("grows a fill to the new shape around the original", () => {
    const size = targetSize(
      { tool: "fill", aspect: "16:9" },
      { width: 800, height: 800 }
    );
    expect(size.height).toBe(800);
    expect(size.width).toBe(1422);
  });
});

describe("cloudinaryOptions", () => {
  it("maps each tool", () => {
    expect(cloudinaryOptions({ tool: "removeBackground" })).toEqual({
      removeBackground: true,
    });
    expect(
      cloudinaryOptions({ tool: "recolor", object: " car ", color: "red" })
    ).toEqual({
      recolor: { prompt: "car", to: "red", multiple: true },
    });
    expect(cloudinaryOptions({ tool: "fill", aspect: "1:1" })).toEqual({
      fillBackground: true,
      crop: "pad",
    });
  });
});

describe("isEditTool", () => {
  it("accepts the five and the old route names", () => {
    expect(isEditTool("removeBackground")).toBe(true);
    expect(isEditTool("sharpen")).toBe(false);
  });
});
