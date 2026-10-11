import { describe, expect, it } from "vitest";
import { mediaByBrief } from "./media";

const run = (id: string, brief: string, parts: unknown[]) => [
  { id, role: "user", parts: [{ type: "text", text: brief }] },
  { id: `${id}-a`, role: "assistant", parts },
];

describe("mediaByBrief", () => {
  it("groups each run's finished outputs under its brief, newest brief first", () => {
    const groups = mediaByBrief([
      ...run("1", "a poster and a track", [
        {
          type: "tool-generate_image",
          state: "output-available",
          output: { urls: ["/a.jpg", "/b.jpg"], prompt: "poster" },
        },
        { type: "text", text: "Here." },
        {
          type: "tool-generate_music",
          state: "output-available",
          input: { prompt: "strings" },
          output: { url: "/s.mp3" },
        },
      ]),
      ...run("2", "a clip", [
        {
          type: "tool-generate_video",
          state: "output-available",
          output: { url: "/c.mp4", prompt: "canyon" },
        },
      ]),
    ] as never);
    expect(groups.map((g) => g.brief)).toEqual([
      "a clip",
      "a poster and a track",
    ]);
    expect(groups[1].items).toEqual([
      { url: "/a.jpg", kind: "image", prompt: "poster" },
      { url: "/b.jpg", kind: "image", prompt: "poster" },
      { url: "/s.mp3", kind: "music", prompt: "strings" },
    ]);
  });

  it("leaves out failed and unfinished pieces, and briefs that made nothing", () => {
    const groups = mediaByBrief([
      ...run("1", "words only", [{ type: "text", text: "Three taglines…" }]),
      ...run("2", "a clip", [
        {
          type: "tool-generate_video",
          state: "output-error",
          errorText: "busy",
        },
        {
          type: "tool-generate_image",
          state: "input-available",
          input: { prompt: "x" },
        },
      ]),
    ] as never);
    expect(groups).toEqual([]);
  });
});
