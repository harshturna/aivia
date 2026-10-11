import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_CHARS,
  MAX_HISTORY_MESSAGES,
  recentHistory,
} from "./history";

const msg = (role: string, text: string) => ({
  role,
  parts: [{ type: "text", text }],
});

describe("recentHistory", () => {
  it("keeps a short conversation whole", () => {
    const all = [msg("user", "a"), msg("assistant", "b"), msg("user", "c")];
    expect(recentHistory(all)).toEqual(all);
  });

  it("keeps the latest messages, starting on a brief", () => {
    const all = Array.from({ length: 40 }, (_, i) =>
      msg(i % 2 ? "assistant" : "user", String(i))
    );
    const out = recentHistory(all) ?? [];
    expect(out.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES);
    expect(out[0].role).toBe("user");
    expect(out[out.length - 1]).toBe(all[39]);
  });

  it("drops old messages past the character limit", () => {
    const big = "x".repeat(MAX_HISTORY_CHARS / 2 + 1);
    const all = [msg("user", big), msg("assistant", big), msg("user", "now")];
    const out = recentHistory(all) ?? [];
    expect(out.map((m) => m.parts[0].text)).toEqual(["now"]);
  });

  it("refuses a latest message that is too long by itself", () => {
    expect(
      recentHistory([msg("user", "x".repeat(MAX_HISTORY_CHARS + 1))])
    ).toBeNull();
  });
});
