import { describe, expect, it } from "vitest";
import {
  assetsFromMessages,
  claimedSessionId,
  type LocalMessage,
  MAX_CLAIM_ASSETS,
  MAX_LOCAL_SESSIONS,
  parseClaim,
  sanitizeMessages,
} from "./claim";
import { GUEST_EXAMPLES } from "./guest-examples";

const forest = GUEST_EXAMPLES[0].messages as unknown as LocalMessage[];
const ID = "11111111-2222-4333-8444-555555555555";

describe("sanitizeMessages", () => {
  it("keeps what a brief was sent with, and drops oversized metadata", () => {
    const [kept, dropped] = sanitizeMessages([
      { id: "a", role: "user", parts: [], metadata: { mode: "image" } },
      { id: "b", role: "user", parts: [], metadata: { x: "y".repeat(3000) } },
    ]);
    expect(kept.metadata).toEqual({ mode: "image" });
    expect(dropped.metadata).toBeUndefined();
  });

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

describe("hardening (TICKET-042)", () => {
  it("survives malformed input instead of throwing", () => {
    expect(sanitizeMessages(null)).toEqual([]);
    expect(
      sanitizeMessages([
        null,
        3,
        { role: "user", parts: "x" },
        { role: "user", parts: [null, { type: 1 }] },
      ])
    ).toEqual([{ id: "undefined", role: "user", parts: [] }]);
    expect(parseClaim({ sessions: [null, "x"] })).toBeNull();
    expect(
      assetsFromMessages([
        {
          id: "a",
          role: "assistant",
          parts: [
            {
              type: "tool-generate_image",
              state: "output-available",
              output: { urls: { a: 1 } } as never,
            },
          ],
        },
      ])
    ).toEqual([]);
  });

  it("caps the outputs kept per session", () => {
    const urls = Array.from({ length: 500 }, (_, i) => `https://a.b/${i}`);
    expect(
      assetsFromMessages([
        {
          id: "a",
          role: "assistant",
          parts: [
            {
              type: "tool-generate_image",
              state: "output-available",
              output: { urls },
            },
          ],
        },
      ])
    ).toHaveLength(MAX_CLAIM_ASSETS);
  });

  it("derives a stable uuid per account and browser id", async () => {
    const a = await claimedSessionId("user-1", ID);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(await claimedSessionId("user-1", ID)).toBe(a);
    expect(await claimedSessionId("user-2", ID)).not.toBe(a);
    expect(a).not.toBe(ID);
  });
});

describe("parseEdits", () => {
  const doc = {
    schema: "aivia.timeline",
    version: 1,
    fps: 24,
    width: 1280,
    height: 720,
    media: {
      a: {
        url: "https://v3.fal.media/files/a.mp4",
        kind: "video",
        durationMs: 5000,
      },
      b: { url: "javascript:alert(1)", kind: "image" },
    },
    tracks: [
      { id: "text", kind: "text", items: [] },
      {
        id: "main",
        kind: "main",
        items: [
          {
            id: "1",
            type: "video",
            media: "a",
            in: 0,
            start: 0,
            duration: 5000,
            volume: 0,
          },
          { id: "2", type: "image", media: "b", start: 5000, duration: 3000 },
        ],
      },
    ],
  };
  const id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

  it("keeps a cut and leaves out media at unsafe addresses", async () => {
    const { parseEdits } = await import("./claim");
    const [edit] = parseEdits({
      edits: [{ id, projectId: null, title: "My cut", doc }],
    });
    expect(Object.keys(edit.doc.media)).toEqual(["a"]);
    const main = edit.doc.tracks.find((t) => t.kind === "main");
    expect(main?.items.map((i) => i.id)).toEqual(["1"]);
  });

  it("drops junk, bad ids and documents that are not cuts", async () => {
    const { parseEdits } = await import("./claim");
    expect(parseEdits({ edits: [{ id: "nope", doc }] })).toEqual([]);
    expect(parseEdits({ edits: [{ id, doc: { hello: 1 } }] })).toEqual([]);
    expect(parseEdits({ edits: "x" })).toEqual([]);
    expect(parseEdits(null)).toEqual([]);
  });

  it("gives an edit its own claimed id, distinct from a session's", async () => {
    const { claimedEditId, claimedSessionId } = await import("./claim");
    expect(await claimedEditId("u", id)).not.toBe(
      await claimedSessionId("u", id)
    );
    expect(await claimedEditId("u", id)).toBe(await claimedEditId("u", id));
  });
});
