// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addAudio, addToMain, trimEnd } from "@/lib/timeline/ops";
import { emptyDoc, type TimelineDoc } from "@/lib/timeline/schema";

const h = vi.hoisted(() => ({
  canvasesCalls: 0,
  returnCalls: 0,
  mixCalls: [] as number[],
  sinkResolve: null as null | (() => void),
  sinkDelay: false,
}));

vi.mock("@/components/timeline/compositor", () => ({
  drawFrame: () => {},
  readTheme: () => ({ bg: "#000", fg: "#fff", family: "serif" }),
  titleSize: () => 10,
}));
vi.mock("@/components/timeline/export", () => ({
  mixAudio: async (_d: unknown, seconds: number) => {
    h.mixCalls.push(seconds);
    return { duration: seconds } as unknown as AudioBuffer;
  },
}));
vi.mock("mediabunny", () => {
  class CanvasSink {
    canvases() {
      h.canvasesCalls++;
      let n = 0;
      return {
        next: async () => ({
          done: false,
          value: { canvas: {}, timestamp: n++ / 24 },
        }),
        return: async () => {
          h.returnCalls++;
          return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
    }
    async getCanvas() {
      return { canvas: {}, timestamp: 0 };
    }
  }
  class Input {
    async getPrimaryVideoTrack() {
      if (h.sinkDelay)
        await new Promise<void>((r) => {
          h.sinkResolve = r;
        });
      return {};
    }
  }
  return { Input, UrlSource: class {}, ALL_FORMATS: [], CanvasSink };
});

let rafs: Array<() => void> = [];
let sources: Array<{ started: number; stopped: number }> = [];
let now = 0;
beforeEach(() => {
  h.canvasesCalls = 0;
  h.returnCalls = 0;
  h.mixCalls = [];
  h.sinkDelay = false;
  rafs = [];
  sources = [];
  now = 0;
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
    rafs.push(f);
    return rafs.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  class AC {
    get currentTime() {
      return now;
    }
    destination = {};
    async resume() {}
    async close() {}
    createBufferSource() {
      const s = {
        started: 0,
        stopped: 0,
        buffer: null as unknown,
        connect() {},
        start() {
          s.started++;
        },
        stop() {
          s.stopped++;
        },
      };
      sources.push(s);
      return s;
    }
  }
  vi.stubGlobal("AudioContext", AC);
  HTMLCanvasElement.prototype.getContext = (() => ({})) as never;
});
afterEach(() => vi.unstubAllGlobals());

async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}
async function runFrames(n: number, dt = 1 / 60) {
  for (let i = 0; i < n; i++) {
    now += dt;
    const fs = rafs;
    rafs = [];
    await act(async () => {
      for (const f of fs) f();
      await flush();
    });
  }
}

const { usePlayer } = await import("@/components/timeline/use-player");

function videoDoc(): TimelineDoc {
  let d = emptyDoc();
  d = addToMain(d, { url: "a.mp4", kind: "video", durationMs: 4000 }).doc;
  return d;
}

describe("usePlayer", () => {
  it("starts at most one sound when Play is pressed twice while the mix loads", async () => {
    const canvas = { current: document.createElement("canvas") };
    const doc = addAudio(videoDoc(), {
      url: "m.mp3",
      kind: "music",
      durationMs: 10000,
    }).doc;
    const { result } = renderHook(() => usePlayer(doc, canvas));
    await act(async () => {
      result.current.toggle();
      result.current.toggle();
      await flush();
    });
    await act(async () => {
      result.current.pause();
      await flush();
    });
    expect(sources.length).toBeLessThanOrEqual(1);
    expect(sources.filter((s) => s.stopped === 0).length).toBeLessThanOrEqual(
      1
    );
  });

  it("opens one frame reader per clip while its sink is still opening", async () => {
    h.sinkDelay = true;
    const canvas = { current: document.createElement("canvas") };
    const doc = videoDoc();
    const { result } = renderHook(() => usePlayer(doc, canvas));
    // let the paused paint's sink open first? No: start at a fresh clip: the paused paint shares the promise
    await act(async () => {
      void result.current.play();
      await flush();
    });
    await runFrames(10);
    await act(async () => {
      h.sinkResolve?.();
      await flush();
    });
    await runFrames(1);
    await act(async () => {
      result.current.pause();
      await flush();
    });
    expect(h.canvasesCalls - h.returnCalls).toBeLessThanOrEqual(1);
  });

  it("mixes the sound again when the cut gets longer", async () => {
    const canvas = { current: document.createElement("canvas") };
    let doc = addAudio(videoDoc(), {
      url: "m.mp3",
      kind: "music",
      durationMs: 30000,
    }).doc;
    const { result, rerender } = renderHook(({ d }) => usePlayer(d, canvas), {
      initialProps: { d: doc },
    });
    await act(async () => {
      await result.current.play();
      await flush();
    });
    await act(async () => {
      result.current.pause();
      await flush();
    });
    const _clip = (
      doc.tracks.find((t) => t.kind === "main") as {
        items: Array<{ id: string }>;
      }
    ).items[0].id;
    // make the cut longer: a still after the clip
    doc = addToMain(doc, { url: "s.png", kind: "image" }).doc; // changes media -> new key, so use trim instead
    doc = trimEnd(
      doc,
      (
        doc.tracks.find((t) => t.kind === "main") as {
          items: Array<{ id: string }>;
        }
      ).items[1].id,
      4000
    );
    rerender({ d: doc });
    await act(async () => {
      await result.current.play();
      await flush();
    });
    await act(async () => {
      result.current.pause();
      await flush();
    });
    const before = h.mixCalls.length;
    doc = trimEnd(
      doc,
      (
        doc.tracks.find((t) => t.kind === "main") as {
          items: Array<{ id: string }>;
        }
      ).items[1].id,
      3000
    );
    rerender({ d: doc });
    await act(async () => {
      await result.current.play();
      await flush();
    });
    expect(h.mixCalls.length).toBe(before + 1);
  });
});
