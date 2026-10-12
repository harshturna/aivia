import { describe, expect, it } from "vitest";
import { pieceRequest, takeFor } from "./piece-request";

const out = (type: string, input: object, output: object) => ({
  type,
  state: "output-available",
  input,
  output,
});

describe("making a piece again", () => {
  it("reads a tool call's mode and nearest parameters", () => {
    expect(
      pieceRequest(
        out(
          "tool-generate_image",
          { prompt: "a fox", amount: 3, aspect: "3:4" },
          {}
        )
      )
    ).toEqual({
      prompt: "a fox",
      mode: "image",
      params: { count: 3, aspect: "3:4" },
    });
    expect(
      pieceRequest(
        out("tool-generate_music", { prompt: "piano", seconds: 40 }, {})
      ).params
    ).toEqual({
      musicSeconds: 30,
    });
  });

  it("repeats a direct run as it was sent, one piece, with an Animate's still", () => {
    const messages = [
      {
        id: "u1",
        role: "user",
        metadata: { mode: "video", params: { aspect: "3:4" }, scene: "an owl" },
        parts: [
          { type: "text", text: "Bring this to life" },
          {
            type: "file",
            mediaType: "image/jpeg",
            url: "https://v3.fal.media/owl.jpg",
          },
        ],
      },
      {
        id: "a1",
        role: "assistant",
        parts: [
          out(
            "tool-generate_video",
            { prompt: "the owl lifts off", animate: true },
            { url: "https://v3.fal.media/clip.mp4" }
          ),
        ],
      },
    ];
    expect(takeFor(messages, "https://v3.fal.media/clip.mp4")).toEqual({
      prompt: "Bring this to life",
      mode: "video",
      params: { aspect: "3:4" },
      scene: "an owl",
      files: [
        {
          type: "file",
          mediaType: "image/jpeg",
          url: "https://v3.fal.media/owl.jpg",
        },
      ],
    });
  });

  it("repeats an Auto run's piece from its own call, one image of four", () => {
    const messages = [
      {
        id: "u1",
        role: "user",
        metadata: { mode: "auto" },
        parts: [{ type: "text", text: "A launch kit" }],
      },
      {
        id: "a1",
        role: "assistant",
        parts: [
          out(
            "tool-generate_image",
            { prompt: "a poster", amount: 4 },
            { urls: ["/a.jpg", "/b.jpg"] }
          ),
          out(
            "tool-generate_video",
            { prompt: "a teaser", aspect: "16:9" },
            { url: "/c.mp4" }
          ),
        ],
      },
    ];
    expect(takeFor(messages, "/b.jpg")).toEqual({
      prompt: "a poster",
      mode: "image",
      params: { count: 1 },
      files: [],
    });
    expect(takeFor(messages, "/c.mp4")?.params).toEqual({
      videoAspect: "16:9",
    });
    expect(takeFor(messages, "/nowhere.jpg")).toBeNull();
  });

  it("keeps the piece's shape when the run did not name one", () => {
    const messages = [
      {
        id: "u1",
        role: "user",
        metadata: { mode: "auto" },
        parts: [{ type: "text", text: "A kit" }],
      },
      {
        id: "a1",
        role: "assistant",
        parts: [
          out(
            "tool-generate_image",
            { prompt: "a poster" },
            { urls: ["/a.jpg"] }
          ),
          out("tool-generate_video", { prompt: "a teaser" }, { url: "/c.mp4" }),
          out(
            "tool-generate_image",
            { prompt: "a square", aspect: "1:1" },
            { urls: ["/s.jpg"] }
          ),
        ],
      },
    ];
    expect(
      takeFor(messages, "/a.jpg", { width: 1200, height: 1800 })?.params
    ).toEqual({
      count: 1,
      aspect: "3:4",
    });
    expect(
      takeFor(messages, "/c.mp4", { width: 720, height: 1280 })?.params
    ).toEqual({
      videoAspect: "9:16",
    });
    // a shape the run named stays
    expect(
      takeFor(messages, "/s.jpg", { width: 1600, height: 900 })?.params.aspect
    ).toBe("1:1");
  });

  it("offers no take of a clip animated from a pasted photo, and keeps a planned track's length", () => {
    const messages = [
      {
        id: "u1",
        role: "user",
        metadata: { mode: "video", params: { aspect: "9:16" } },
        parts: [
          { type: "text", text: "Bring this to life" },
          {
            type: "file",
            mediaType: "image/jpeg",
            url: "data:image/jpeg;base64,AAAA",
          },
        ],
      },
      {
        id: "a1",
        role: "assistant",
        parts: [
          out(
            "tool-generate_video",
            { prompt: "motion", animate: true },
            { url: "/clip.mp4" }
          ),
        ],
      },
      {
        id: "u2",
        role: "user",
        metadata: { mode: "auto" },
        parts: [{ type: "text", text: "A score" }],
      },
      {
        id: "a2",
        role: "assistant",
        parts: [
          out(
            "tool-generate_music",
            { prompt: "strings", durationSeconds: 60 },
            { url: "/m.mp3" }
          ),
        ],
      },
    ];
    expect(takeFor(messages, "/clip.mp4")).toBeNull();
    expect(takeFor(messages, "/m.mp3")?.params).toEqual({ musicSeconds: 60 });
  });
});
