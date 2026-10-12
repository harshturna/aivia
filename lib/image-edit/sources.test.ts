import { describe, expect, it } from "vitest";
import { isEditableUrl } from "./sources";

const base = "https://abc.supabase.co";

describe("what the editor opens", () => {
  it("takes generated media, the site's pictures, results and our storage", () => {
    expect(isEditableUrl("https://v3.fal.media/files/x/y.jpg", base)).toBe(
      true
    );
    expect(isEditableUrl("/landing/tree.jpg", base)).toBe(true);
    expect(
      isEditableUrl(
        "https://res.cloudinary.com/demo/image/upload/e_restore/a",
        base
      )
    ).toBe(true);
    expect(
      isEditableUrl(`${base}/storage/v1/object/public/media/u/f.jpg`, base)
    ).toBe(true);
  });

  it("refuses everything else", () => {
    expect(isEditableUrl("https://evil.example/fal.media/x.jpg", base)).toBe(
      false
    );
    expect(isEditableUrl("http://v3.fal.media/x.jpg", base)).toBe(false);
    expect(isEditableUrl("https://fal.media.evil.example/x.jpg", base)).toBe(
      false
    );
    expect(
      isEditableUrl(`${base}/storage/v1/object/public/other/f.jpg`, base)
    ).toBe(false);
    expect(isEditableUrl("/landing/../secret", base)).toBe(false);
    expect(isEditableUrl("javascript:alert(1)", base)).toBe(false);
  });

  it("decides on the normalised address", () => {
    // an encoded ".." resolves out of the media bucket
    expect(
      isEditableUrl(
        `${base}/storage/v1/object/public/media/%2e%2e/other/x.png`,
        base
      )
    ).toBe(false);
    expect(
      isEditableUrl(
        `${base}/storage/v1/object/public/media/u/../../other/x.png`,
        base
      )
    ).toBe(false);
    expect(isEditableUrl("/landing/../x.jpg", base)).toBe(false);
  });

  it("takes the site's own pictures by its own origin only", () => {
    expect(
      isEditableUrl(
        "http://localhost:3005/landing/tree.jpg",
        base,
        "http://localhost:3005"
      )
    ).toBe(true);
    expect(
      isEditableUrl(
        "https://evil.example/landing/tree.jpg",
        base,
        "http://localhost:3005"
      )
    ).toBe(false);
    expect(
      isEditableUrl(
        "http://localhost:3005/api/x",
        base,
        "http://localhost:3005"
      )
    ).toBe(false);
  });
});
