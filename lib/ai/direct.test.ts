import { describe, expect, it } from "vitest";
import { ASPECT_SIZES, costOf, DirectRequest } from "./direct";

describe("DirectRequest", () => {
  it("fills defaults", () => {
    const r = DirectRequest.parse({ mode: "image" });
    expect(r.params.count).toBe(1);
    expect(r.params.aspect).toBe("1:1");
  });

  it("rejects an unknown mode and out-of-range parameters", () => {
    expect(DirectRequest.safeParse({ mode: "auto" }).success).toBe(false);
    expect(
      DirectRequest.safeParse({ mode: "image", params: { count: 9 } }).success
    ).toBe(false);
    expect(
      DirectRequest.safeParse({ mode: "video", params: { videoSeconds: 20 } })
        .success
    ).toBe(false);
  });
});

describe("costOf", () => {
  it("charges per image and one for everything else", () => {
    expect(
      costOf(DirectRequest.parse({ mode: "image", params: { count: 3 } }))
    ).toBe(3);
    expect(costOf(DirectRequest.parse({ mode: "video" }))).toBe(1);
  });
});

describe("ASPECT_SIZES", () => {
  it("keeps every size under one megapixel and on a 32 px grid", () => {
    for (const { width, height } of Object.values(ASPECT_SIZES)) {
      expect(width * height).toBeLessThan(1_000_000);
      expect(width % 32).toBe(0);
      expect(height % 32).toBe(0);
    }
  });
});
