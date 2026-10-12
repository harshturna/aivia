import { describe, expect, it } from "vitest";
import { checkPath, sniff } from "./upload-check";

const me = "1b2c3d4e-0000-4000-8000-000000000001";
const file = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("checkPath", () => {
  it("takes a file in the caller's own folder", () => {
    expect(checkPath(me, `${me}/${file}.mp4`)).toBe("mp4");
    expect(checkPath(me, `${me}/${file}.webp`)).toBe("webp");
  });
  it("refuses another person's folder, folders of our own and other names", () => {
    expect(
      checkPath(me, `1b2c3d4e-0000-4000-8000-000000000002/${file}.mp4`)
    ).toBeNull();
    expect(checkPath(me, `${me}/x/${file}.mp4`)).toBeNull();
    expect(checkPath(me, `${me}/../${file}.mp4`)).toBeNull();
    expect(checkPath(me, `${me}/${file}.exe`)).toBeNull();
    expect(checkPath(me, `${me}/cut.mp4`)).toBeNull();
  });
});

describe("sniff", () => {
  const bytes = (...xs: number[]) => new Uint8Array(xs);
  const text = (s: string) => Array.from(s).map((c) => c.charCodeAt(0));
  it("reads each kind from its first bytes", () => {
    expect(sniff(bytes(0, 0, 0, 24, ...text("ftypisom")))).toBe("mp4");
    expect(sniff(bytes(0x1a, 0x45, 0xdf, 0xa3))).toBe("webm");
    expect(sniff(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(sniff(bytes(0x89, ...text("PNG")))).toBe("png");
    expect(sniff(bytes(...text("RIFF"), 1, 2, 3, 4, ...text("WEBP")))).toBe(
      "webp"
    );
  });
  it("names nothing it does not know", () => {
    expect(sniff(bytes(...text("<html>")))).toBeNull();
    expect(sniff(new Uint8Array())).toBeNull();
  });
});
