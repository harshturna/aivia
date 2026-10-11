import { describe, expect, it } from "vitest";
import { formatDuration } from "./duration";

describe("formatDuration", () => {
  it("writes minutes and two-digit seconds", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(30)).toBe("0:30");
  });
  it("rolls past a minute instead of writing 0:75", () => {
    expect(formatDuration(75)).toBe("1:15");
  });
  it("rounds and never goes negative", () => {
    expect(formatDuration(4.6)).toBe("0:05");
    expect(formatDuration(-3)).toBe("0:00");
  });
});
