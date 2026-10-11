import { describe, expect, it } from "vitest";
import { classifyImageUrl, MAX_IMAGE_BYTES } from "./image-url";

describe("classifyImageUrl", () => {
  it("passes https, image data URLs and the site's own media", () => {
    expect(classifyImageUrl("https://v3b.fal.media/files/a.jpg")).toBe(
      "remote"
    );
    expect(classifyImageUrl("data:image/png;base64,AAAA")).toBe("data");
    expect(classifyImageUrl("/landing/tree.jpg")).toBe("site");
  });

  it("refuses anything that could reach another host or another file", () => {
    for (const bad of [
      "//evil.com/x.png",
      "/\\evil.com/x.png",
      "/\t/evil.com/a.png",
      "/landing/../.env",
      "/landing/a/b.jpg",
      "/api/assets/1.jpg",
      "http://169.254.169.254/latest",
      "https:evil.com",
      "data:text/html;base64,PHNjcmlwdD4=",
      "javascript:alert(1)",
      42,
    ])
      expect(classifyImageUrl(bad), String(bad)).toBeNull();
  });

  it("caps data URLs", () => {
    const big = `data:image/png;base64,${"A".repeat(MAX_IMAGE_BYTES * 2)}`;
    expect(classifyImageUrl(big)).toBeNull();
  });
});
