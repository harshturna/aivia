// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addToMain } from "@/lib/timeline/ops";
import { emptyDoc, type TimelineDoc } from "@/lib/timeline/schema";

const h = vi.hoisted(() => ({ last: null as null | TimelineDoc }));

vi.mock("@/components/timeline/use-player", () => ({
  usePlayer: () => ({
    playing: false,
    loading: false,
    time: 0,
    length: 0,
    play: async () => {},
    pause: () => {},
    seek: () => {},
    toggle: () => {},
    onTick: () => () => {},
    fontReady: async () => {},
  }),
}));
vi.mock("@/components/timeline/timeline", () => ({
  Timeline: (p: { doc: TimelineDoc }) => {
    h.last = p.doc;
    return null;
  },
}));
vi.mock("@/components/timeline/storyboard", () => ({ Storyboard: () => null }));
vi.mock("@/components/timeline/inspector", () => ({ Inspector: () => null }));
vi.mock("@/components/media/tray", () => ({ MediaTray: () => null }));
vi.mock("@/components/shell/screen", () => ({
  ScreenHeader: (p: { children: React.ReactNode }) => <div>{p.children}</div>,
}));
vi.mock("@/hooks/useProModal", () => ({
  userProModal: () => ({ onOpen: () => {} }),
}));
vi.mock("@/components/studio/piece-request", () => ({ takeFor: () => null }));
vi.mock("@/lib/storage", () => ({ uploadMedia: async () => "" }));
vi.mock("@/components/timeline/export", () => ({
  probeVideo: async () => ({ width: 1280, height: 720, durationMs: 3000 }),
  renderTimeline: async () => {
    throw new Error("no");
  },
}));
vi.mock("@/components/timeline/start", () => ({
  startingCut: async () => (await import("@/lib/timeline/schema")).emptyDoc(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
}));
vi.mock("next/link", () => ({
  default: (p: { children: React.ReactNode }) => <a href="/">{p.children}</a>,
}));

const { CutView, queueForCut } = await import("@/components/timeline/cut-view");
const mainCount = (d: TimelineDoc | null) =>
  d?.tracks.find((t) => t.kind === "main")?.items.length ?? -1;
const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  h.last = null;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

function existing() {
  let d = emptyDoc();
  d = addToMain(d, { url: "old.png", kind: "image" }).doc;
  return d;
}

describe("CutView add to cut from Make", () => {
  it("adds a guest's queued piece to the cut kept in the browser", async () => {
    const proj = "11111111-1111-4111-8111-111111111111";
    localStorage.setItem(
      "aivia:guest-edits",
      JSON.stringify([
        {
          id: "e1",
          projectId: proj,
          title: "t",
          doc: existing(),
          updatedAt: 1,
        },
      ])
    );
    queueForCut(proj, { url: "new.png", kind: "image", prompt: "p" } as never);
    render(
      <CutView
        projectId={proj}
        title="t"
        isGuest
        initialMessages={[]}
        saved={null}
        run={null}
      />
    );
    await tick(50);
    await tick(1000);
    const saved = JSON.parse(localStorage.getItem("aivia:guest-edits") ?? "[]");
    const urls = (
      Object.values(saved[0].doc.media) as Array<{ url: string }>
    ).map((m) => m.url);
    expect(urls).toEqual(["old.png", "new.png"]);
  });

  it("adds every queued piece, not only the last", async () => {
    const proj = "22222222-2222-4222-8222-222222222222";
    const puts: unknown[] = [];
    vi.stubGlobal("fetch", async (_u: string, init: RequestInit) => {
      puts.push(JSON.parse(String(init.body)));
      return new Response(JSON.stringify({ rev: 2, id: "e" }), { status: 200 });
    });
    queueForCut(proj, { url: "a.png", kind: "image", prompt: "a" } as never);
    queueForCut(proj, { url: "b.png", kind: "image", prompt: "b" } as never);
    render(
      <CutView
        projectId={proj}
        title="t"
        isGuest={false}
        initialMessages={[]}
        saved={{ id: "e", rev: 1, doc: existing() }}
        run={null}
      />
    );
    await tick(50);
    await tick(1000);
    expect(mainCount(h.last)).toBe(3);
    vi.unstubAllGlobals();
  });
});
