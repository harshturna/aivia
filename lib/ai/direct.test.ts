import { describe, expect, it } from "vitest";
import {
  ANIMATE_BRIEF,
  ASPECT_SIZES,
  animateAspect,
  animatePrompt,
  aspectOfSize,
  costOf,
  DirectRequest,
  imageInBrief,
} from "./direct";

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
      DirectRequest.safeParse({ mode: "video", params: { videoAspect: "4:3" } })
        .success
    ).toBe(false);
  });

  it("makes a landscape clip unless asked otherwise", () => {
    expect(DirectRequest.parse({ mode: "video" }).params.videoAspect).toBe(
      "16:9"
    );
    expect(
      DirectRequest.parse({ mode: "video", params: { videoAspect: "9:16" } })
        .params.videoAspect
    ).toBe("9:16");
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

describe("animate", () => {
  it("finds the first attached image in a brief", () => {
    expect(
      imageInBrief([
        { type: "text" },
        { type: "file", mediaType: "application/pdf", url: "a.pdf" },
        { type: "file", mediaType: "image/png", url: "b.png" },
        { type: "file", mediaType: "image/jpeg", url: "c.jpg" },
      ])
    ).toBe("b.png");
    expect(imageInBrief([{ type: "text" }])).toBeNull();
  });

  it("maps any aspect to one the model takes", () => {
    expect(animateAspect("4:3")).toBe("16:9");
    expect(animateAspect("3:4")).toBe("9:16");
    expect(animateAspect("1:1")).toBe("1:1");
    expect(aspectOfSize(1600, 893)).toBe("16:9");
    expect(aspectOfSize(1211, 1600)).toBe("9:16");
    expect(aspectOfSize(1000, 1050)).toBe("1:1");
  });

  it("keeps the scene and asks for gentle motion", () => {
    expect(animatePrompt(ANIMATE_BRIEF, "A fox asleep on moss.")).toBe(
      "A fox asleep on moss. Gentle, natural motion brings the scene to life; the camera holds steady."
    );
    expect(animatePrompt("Leaves drifting down")).toMatch(
      /^Leaves drifting down\. Gentle/
    );
    expect(animatePrompt(ANIMATE_BRIEF)).toMatch(/^Gentle, natural motion/);
  });
});
