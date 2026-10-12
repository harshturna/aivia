import { describe, expect, it } from "vitest";
import { withAlpha } from "./color";

describe("a token's colour at an opacity", () => {
  it("reads hex and rgb tokens", () => {
    expect(withAlpha("#0e0e0d", 0.5)).toBe("rgba(14, 14, 13, 0.5)");
    expect(withAlpha(" rgb(5 10 8 / 0.6) ", 0.3)).toBe("rgba(5, 10, 8, 0.3)");
  });
  it("leaves anything else as it is", () => {
    expect(withAlpha("canvastext", 0.5)).toBe("canvastext");
  });
});
