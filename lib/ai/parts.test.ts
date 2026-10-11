import { describe, expect, it } from "vitest";
import { groupTextParts } from "./parts";

describe("groupTextParts", () => {
  it("merges adjacent text parts into one block", () => {
    const parts = [
      { type: "text", text: "Rain on glass" },
      { type: "text", text: "." },
      { type: "text", text: " Then a" },
    ];
    expect(groupTextParts(parts)).toEqual([
      { kind: "text", text: "Rain on glass. Then a" },
    ]);
  });

  it("keeps a tool call where it happened", () => {
    const tool = { type: "tool-generate_image", state: "output-available" };
    const parts = [
      { type: "text", text: "First " },
      tool,
      { type: "text", text: "after" },
    ];
    expect(groupTextParts(parts)).toEqual([
      { kind: "text", text: "First " },
      { kind: "part", part: tool },
      { kind: "text", text: "after" },
    ]);
  });

  it("treats a text part with no text as empty", () => {
    expect(groupTextParts([{ type: "text" }])).toEqual([
      { kind: "text", text: "" },
    ]);
  });
});
