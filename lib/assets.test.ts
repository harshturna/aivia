import { describe, expect, it } from "vitest";
import { groupByDay } from "./assets";
import { isSessionId, messageText, titleFromBrief } from "./sessions";

describe("groupByDay", () => {
  const now = new Date("2026-10-10T18:00:00Z");
  const at = (iso: string) => ({ createdAt: new Date(iso), id: iso });

  it("labels today and yesterday, then the date, newest first", () => {
    const groups = groupByDay(
      [
        at("2026-10-10T09:00:00Z"),
        at("2026-10-10T01:00:00Z"),
        at("2026-10-09T23:00:00Z"),
        at("2026-10-03T12:00:00Z"),
        at("2025-12-24T12:00:00Z"),
      ],
      now,
      "UTC"
    );
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ["Today", 2],
      ["Yesterday", 1],
      ["3 October", 1],
      ["24 December 2025", 1],
    ]);
  });

  it("groups by the viewer's day, not UTC", () => {
    // 01:00 UTC on the 10th is still the 9th in Los Angeles
    const groups = groupByDay(
      [at("2026-10-10T01:00:00Z")],
      new Date("2026-10-10T18:00:00Z"),
      "America/Los_Angeles"
    );
    expect(groups[0].label).toBe("Yesterday");
  });

  it("returns nothing for nothing", () => {
    expect(groupByDay([], now, "UTC")).toEqual([]);
  });
});

describe("titleFromBrief", () => {
  it("capitalises and trims to one line", () => {
    expect(titleFromBrief("  a poster for\n the night market ")).toBe(
      "A poster for the night market"
    );
  });
  it("cuts a long brief with an ellipsis", () => {
    const title = titleFromBrief("x".repeat(100));
    expect(title.length).toBe(58);
    expect(title.endsWith("…")).toBe(true);
  });
  it("cuts a long brief at a word, never inside one", () => {
    const t = titleFromBrief(
      "A poster, a short teaser and a soundtrack for a night market in the rain"
    );
    expect(t).toBe("A poster, a short teaser and a soundtrack for a night…");
  });
  it("drops trailing punctuation before the ellipsis", () => {
    const t = titleFromBrief(
      "Album art for a quiet piano record, with snow, and a name for it, please, now"
    );
    expect(t.endsWith(",…")).toBe(false);
    expect(t.endsWith("…")).toBe(true);
  });
  it("falls back when empty", () => {
    expect(titleFromBrief("   ")).toBe("New session");
  });
});

describe("messageText", () => {
  it("joins the text parts only", () => {
    expect(
      messageText({
        id: "m",
        role: "user",
        parts: [
          { type: "text", text: "a " },
          { type: "file", url: "x", mediaType: "image/png" },
          { type: "text", text: "b" },
        ],
      })
    ).toBe("a b");
  });
});

describe("isSessionId", () => {
  it("accepts a uuid and nothing else", () => {
    expect(isSessionId("3f2b8a0e-1c4d-4e5f-9a6b-7c8d9e0f1a2b")).toBe(true);
    expect(isSessionId("abc")).toBe(false);
    expect(isSessionId("3f2b8a0e-1c4d-4e5f-9a6b-7c8d9e0f1a2b; drop")).toBe(
      false
    );
  });
});
