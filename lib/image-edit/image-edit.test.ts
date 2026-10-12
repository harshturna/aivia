import { describe, expect, it } from "vitest";
import {
  fitCrop,
  moveCrop,
  resizeCrop,
  turnCrop,
  turned,
  withStep,
} from "./geometry";
import { adjustMatrix, applyMatrix, isIdentity } from "./matrix";
import {
  baseOf,
  emptyEdit,
  imageEditSchema,
  isChanged,
  NO_ADJUST,
} from "./schema";

const source = {
  url: "https://v3.fal.media/files/a.jpg",
  width: 1600,
  height: 900,
};

describe("the doc", () => {
  it("starts empty and valid, the source as its base", () => {
    const doc = emptyEdit(source);
    expect(imageEditSchema.safeParse(doc).success).toBe(true);
    expect(isChanged(doc)).toBe(false);
    expect(baseOf(doc)).toEqual(source);
  });

  it("takes the last AI result as the base", () => {
    const doc = emptyEdit(source);
    doc.ai.push({
      tool: "restore",
      url: "https://res.cloudinary.com/x/r.jpg",
      width: 1600,
      height: 900,
    });
    doc.ai.push({
      tool: "fill",
      aspect: "1:1",
      url: "https://res.cloudinary.com/x/f.jpg",
      width: 1600,
      height: 1600,
    });
    expect(baseOf(doc)).toEqual({
      url: "https://res.cloudinary.com/x/f.jpg",
      width: 1600,
      height: 1600,
    });
    expect(isChanged(doc)).toBe(true);
  });

  it("refuses what it does not know", () => {
    const doc = { ...emptyEdit(source), rotate: 45 };
    expect(imageEditSchema.safeParse(doc).success).toBe(false);
    const words = emptyEdit(source);
    words.texts.push({
      id: "t1",
      text: "Hi",
      face: "display",
      color: "red",
      size: 0.1,
      x: 0.5,
      y: 0.5,
    });
    expect(imageEditSchema.safeParse(words).success).toBe(false);
  });

  it("counts empty words as no change", () => {
    const doc = emptyEdit(source);
    doc.texts.push({
      id: "t1",
      text: "  ",
      face: "body",
      color: "#ffffff",
      size: 0.08,
      x: 0.5,
      y: 0.5,
    });
    expect(isChanged(doc)).toBe(false);
  });
});

describe("the colour matrix", () => {
  const px = (r: number, g: number, b: number) =>
    new Uint8ClampedArray([r, g, b, 255]);

  it("leaves pixels alone at zero", () => {
    expect(isIdentity(adjustMatrix(NO_ADJUST))).toBe(true);
    const p = px(10, 120, 240);
    applyMatrix(p, adjustMatrix(NO_ADJUST));
    expect([...p]).toEqual([10, 120, 240, 255]);
  });

  it("brightens, and greys at no saturation", () => {
    const bright = px(100, 100, 100);
    applyMatrix(bright, adjustMatrix({ ...NO_ADJUST, brightness: 50 }));
    expect(bright[0]).toBe(151);
    const grey = px(200, 50, 50);
    applyMatrix(grey, adjustMatrix({ ...NO_ADJUST, saturation: -100 }));
    expect(grey[0]).toBe(grey[1]);
    expect(grey[1]).toBe(grey[2]);
  });

  it("flattens to middle grey at no contrast, and warms red against blue", () => {
    const flat = px(0, 255, 30);
    applyMatrix(flat, adjustMatrix({ ...NO_ADJUST, contrast: -100 }));
    expect([...flat.slice(0, 3)]).toEqual([128, 128, 128]);
    const warm = px(100, 100, 100);
    applyMatrix(warm, adjustMatrix({ ...NO_ADJUST, warmth: 100 }));
    expect(warm[0]).toBeGreaterThan(warm[1]);
    expect(warm[2]).toBeLessThan(warm[1]);
  });
});

describe("the crop", () => {
  it("turns a size by quarters", () => {
    expect(turned({ width: 1600, height: 900 }, 90)).toEqual({
      width: 900,
      height: 1600,
    });
    expect(turned({ width: 1600, height: 900 }, 180)).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it("fits the largest centred box of a shape", () => {
    const c = fitCrop("1:1", { width: 1600, height: 900 });
    expect(c.height).toBe(1);
    expect(c.width).toBeCloseTo(900 / 1600);
    expect(c.x).toBeCloseTo((1 - 900 / 1600) / 2);
    expect(fitCrop("free", { width: 10, height: 10 })).toEqual({
      shape: "free",
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
  });

  it("moves and resizes inside the picture, keeping a fixed shape", () => {
    const size = { width: 1000, height: 1000 };
    const c = fitCrop("1:1", size);
    expect(
      moveCrop({ ...c, width: 0.5, height: 0.5 }, 0.9, -0.2)
    ).toMatchObject({ x: 0.5, y: 0 });
    const r = resizeCrop(c, "se", { x: 0.6, y: 0.3 }, size);
    expect(r.width).toBeCloseTo(r.height);
    expect(r.x).toBe(0);
    const free = resizeCrop(
      { shape: "free", x: 0.2, y: 0.2, width: 0.5, height: 0.5 },
      "nw",
      { x: -1, y: 0.65 },
      size
    );
    expect(free.x).toBe(0);
    expect(free.width).toBeCloseTo(0.7);
    expect(free.height).toBeCloseTo(0.05);
  });

  it("follows the picture when it turns or flips", () => {
    const c = {
      shape: "16:9" as const,
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.3,
    };
    const t = turnCrop(c, "cw");
    expect(t.shape).toBe("9:16");
    expect(t.x).toBeCloseTo(0.5);
    expect(t.y).toBeCloseTo(0.1);
    expect([t.width, t.height]).toEqual([0.3, 0.5]);
    expect(turnCrop(c, "flip").x).toBeCloseTo(0.4);
  });
});

describe("an AI step", () => {
  it("refits a fixed-shape crop when Fill changes the picture's shape", () => {
    const doc = { ...emptyEdit(source), crop: fitCrop("1:1", source) };
    const filled = withStep(doc, {
      tool: "fill",
      aspect: "9:16",
      url: "https://res.cloudinary.com/x/f.jpg",
      width: 900,
      height: 1600,
    });
    expect(filled.ai).toHaveLength(1);
    // still square in pixels on the new 900x1600 picture
    const c = filled.crop;
    expect(c?.shape).toBe("1:1");
    expect(((c?.width ?? 0) * 900) / ((c?.height ?? 1) * 1600)).toBeCloseTo(1);
  });

  it("leaves the crop alone when the shape is the same or free", () => {
    const same = { ...emptyEdit(source), crop: fitCrop("1:1", source) };
    const restored = withStep(same, {
      tool: "restore",
      url: "https://res.cloudinary.com/x/r.jpg",
      width: 1600,
      height: 900,
    });
    expect(restored.crop).toEqual(same.crop);
    const free = {
      ...emptyEdit(source),
      crop: { shape: "free" as const, x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
    };
    expect(
      withStep(free, {
        tool: "fill",
        url: "https://res.cloudinary.com/x/f.jpg",
        width: 900,
        height: 1600,
      }).crop
    ).toEqual(free.crop);
  });

  it("refuses an address the editor would not open", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://169.254.169.254/x.jpg",
      "https://evil.example/a.jpg",
    ])
      expect(
        imageEditSchema.safeParse({
          ...emptyEdit(source),
          source: { ...source, url: bad },
        }).success
      ).toBe(false);
  });
});
