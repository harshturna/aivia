import { describe, expect, it } from "vitest";
import {
  assetsFromMessages,
  type LocalMessage,
  MAX_LOCAL_SESSIONS,
  parseClaim,
  sanitizeMessages,
} from "./claim";
import { GUEST_EXAMPLES } from "./guest-examples";

const forest = GUEST_EXAMPLES[0].messages as unknown as LocalMessage[];
const ID = "11111111-2222-4333-8444-555555555555";

describe("sanitizeMessages", () => {
  it("drops pasted data URLs and keeps real addresses", () => {
    const out = sanitizeMessages([
      {
        id: "u",
        role: "user",
        parts: [
          { type: "text" },
          { type: "file", url: "data:image/png;base64,AAAA" },
          { type: "file", url: "https://v3b.fal.media/a.jpg" },
        ],
      },
      { id: "s", role: "system", parts: [] },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].parts.map((p) => p.url ?? p.type)).toEqual([
      "text",
      "https://v3b.fal.media/a.jpg",
    ]);
  });
});

describe("assetsFromMessages", () => {
  it("reads every output a run shows", () => {
    expect(assetsFromMessages(forest).map((a) => [a.kind, a.url])).toEqual([
      ["image", "/landing/tree.jpg"],
      ["video", "/landing/canyon.mp4"],
      ["music", "/landing/score.mp3"],
    ]);
  });

  it("refuses addresses that are not https or the site's own media", () => {
    const evil = [
      {
        id: "a",
        role: "assistant",
        parts: [
          {
            type: "tool-generate_image",
            state: "output-available",
            output: { urls: ["javascript:alert(1)", "http://x.test/a.jpg"] },
          },
        ],
      },
    ];
    expect(assetsFromMessages(evil)).toEqual([]);
  });
});

describe("parseClaim", () => {
  it("accepts a few real sessions and caps titles", () => {
    const claim = parseClaim({
      sessions: [{ id: ID, title: "x".repeat(200), messages: forest }],
    });
    expect(claim).toHaveLength(1);
    expect(claim?.[0].title).toHaveLength(80);
  });

  it("rejects junk, bad ids, empty sessions and too many", () => {
    expect(parseClaim(null)).toBeNull();
    expect(
      parseClaim({ sessions: [{ id: "nope", messages: forest }] })
    ).toBeNull();
    expect(parseClaim({ sessions: [{ id: ID, messages: [] }] })).toBeNull();
    const many = Array.from({ length: 9 }, () => ({
      id: ID,
      messages: forest,
    }));
    expect(parseClaim({ sessions: many })).toHaveLength(MAX_LOCAL_SESSIONS);
  });
});
