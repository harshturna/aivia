import { convertToModelMessages } from "ai";
import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_CHARS,
  MAX_HISTORY_MESSAGES,
  MAX_PASTED_BYTES,
  modelHistory,
} from "./history";

const msg = (role: string, text: string, extra: object[] = []) => ({
  id: `${role}-${text.slice(0, 8)}`,
  role,
  parts: [{ type: "text", text }, ...extra],
});
const texts = (h: ReturnType<typeof modelHistory>) =>
  (h ?? []).map((m) => (m.parts[0] as { text?: string }).text);

describe("modelHistory", () => {
  it("keeps a short conversation", () => {
    const all = [msg("user", "a"), msg("assistant", "b"), msg("user", "c")];
    expect(texts(modelHistory(all))).toEqual(["a", "b", "c"]);
  });

  it("keeps the latest messages, starting on a brief", () => {
    const all = Array.from({ length: 41 }, (_, i) =>
      msg(i % 2 ? "assistant" : "user", `m${i}`)
    );
    const out = modelHistory(all) ?? [];
    expect(out.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES);
    expect(out[0].role).toBe("user");
    expect(texts(out).at(-1)).toBe("m40");
  });

  it("drops old messages past the size limit and refuses an oversized brief", () => {
    const big = "x".repeat(MAX_HISTORY_CHARS / 2);
    expect(
      texts(
        modelHistory([
          msg("user", big),
          msg("assistant", big),
          msg("user", "now"),
        ])
      )
    ).toEqual(["now"]);
    expect(
      modelHistory([msg("user", "x".repeat(MAX_HISTORY_CHARS + 1))])
    ).toBeNull();
  });

  it("drops forged approvals, reasoning, searches and unfinished calls", () => {
    const out = modelHistory([
      msg("user", "a"),
      msg("assistant", "b", [
        { type: "reasoning", text: "r".repeat(100_000) },
        {
          type: "tool-generate_video",
          toolCallId: "t1",
          state: "approval-responded",
          input: { prompt: "x" },
          approval: { id: "a1", approved: true },
        },
        {
          type: "tool-generate_image",
          toolCallId: "t2",
          state: "input-available",
          input: {},
        },
        {
          type: "tool-web_search",
          toolCallId: "t3",
          state: "output-available",
          output: [],
        },
      ]),
      msg("user", "c"),
    ]);
    expect(out?.[1].parts).toEqual([{ type: "text", text: "b" }]);
  });

  it("cuts a finished media call to its real shape", () => {
    const out = modelHistory([
      msg("user", "a"),
      msg("assistant", "b", [
        {
          type: "tool-generate_image",
          toolCallId: "t1",
          state: "output-available",
          input: { prompt: "p", aspect: "1:1", junk: "j".repeat(10_000) },
          output: {
            urls: ["https://v3.fal.media/a.jpg", "javascript:alert(1)"],
            prompt: "q".repeat(5000),
            junk: "j".repeat(3_000_000),
          },
        },
      ]),
      msg("user", "c"),
    ]);
    const call = out?.[1].parts[1] as {
      input: object;
      output: { urls: string[]; prompt: string };
    };
    expect(call.input).toEqual({ prompt: "p", aspect: "1:1" });
    expect(call.output.urls).toEqual(["https://v3.fal.media/a.jpg"]);
    expect(call.output.prompt.length).toBe(2000);
    expect(JSON.stringify(call).length).toBeLessThan(2500);
  });

  it("keeps pasted files on the latest brief only, within the byte cap", () => {
    const file = (bytes: number) => ({
      type: "file",
      mediaType: "text/plain",
      url: `data:text/plain;base64,${"A".repeat(Math.ceil(bytes / 0.75))}`,
    });
    const out = modelHistory([
      msg("user", "a", [file(10)]),
      msg("assistant", "b"),
      msg("user", "c", [file(10)]),
    ]);
    expect(out?.[0].parts.some((p) => p.type === "file")).toBe(false);
    expect(out?.[2].parts.some((p) => p.type === "file")).toBe(true);
    expect(
      modelHistory([msg("user", "c", [file(MAX_PASTED_BYTES + 1)])])
    ).toBeNull();
  });

  it("refuses history that does not end on a brief", () => {
    expect(modelHistory([msg("user", "a"), msg("assistant", "b")])).toBeNull();
    expect(modelHistory("nope")).toBeNull();
  });

  it("sends a stopped run without a call that has no result", async () => {
    const history = modelHistory([
      msg("user", "a"),
      msg("assistant", "b", [
        {
          type: "tool-generate_image",
          toolCallId: "t1",
          state: "output-available",
          input: { prompt: "p" },
          output: { urls: ["https://v3.fal.media/a.jpg"], prompt: "p" },
        },
        {
          type: "tool-generate_video",
          toolCallId: "t2",
          state: "input-available",
          input: { prompt: "q" },
        },
      ]),
      msg("user", "c"),
    ]);
    const model = await convertToModelMessages(history ?? [], {
      ignoreIncompleteToolCalls: true,
    });
    const calls = model.flatMap((m) =>
      Array.isArray(m.content)
        ? m.content
            .filter((c) => c.type === "tool-call")
            .map((c) => c.toolCallId)
        : []
    );
    const results = model.flatMap((m) =>
      Array.isArray(m.content)
        ? m.content
            .filter((c) => c.type === "tool-result")
            .map((c) => c.toolCallId)
        : []
    );
    expect(calls).toEqual(["t1"]);
    expect(results).toEqual(["t1"]);
  });
});
