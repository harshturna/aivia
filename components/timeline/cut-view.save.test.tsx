// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addText, addToMain } from "@/lib/timeline/ops";
import { emptyDoc, type TimelineDoc } from "@/lib/timeline/schema";

const h = vi.hoisted(() => ({
  onChange: null as null | ((d: TimelineDoc, c: boolean) => void),
  last: null as null | TimelineDoc,
}));
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
  Timeline: (p: {
    doc: TimelineDoc;
    onChange: (d: TimelineDoc, c: boolean) => void;
  }) => {
    h.onChange = p.onChange;
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
  probeVideo: async () => null,
  renderTimeline: async () => null,
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

const { CutView } = await import("@/components/timeline/cut-view");
const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("autosave", () => {
  it("saves one request at a time, the newest after, with no false conflict", async () => {
    const reqs: Array<{
      url: string;
      body: { rev: number };
      keepalive?: boolean;
    }> = [];
    let serverRev = 1;
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      reqs.push({ url, body, keepalive: init.keepalive });
      return new Promise((resolve) =>
        setTimeout(() => {
          if (body.rev !== serverRev)
            return resolve(new Response("stale", { status: 409 }));
          serverRev++;
          resolve(
            new Response(JSON.stringify({ rev: serverRev }), { status: 200 })
          );
        }, 1500)
      );
    });
    const d = addToMain(emptyDoc(), { url: "a.png", kind: "image" }).doc;
    const { container } = render(
      <CutView
        projectId="33333333-3333-4333-8333-333333333333"
        title="t"
        isGuest={false}
        initialMessages={[]}
        saved={{ id: "e", rev: 1, doc: d }}
        run={null}
      />
    );
    await tick(10);
    await act(async () => {
      h.onChange?.(addText(h.last as TimelineDoc, 0).doc, true);
    });
    await tick(900); // first PUT in flight (1500ms)
    await act(async () => {
      h.onChange?.(addText(h.last as TimelineDoc, 500).doc, true);
    });
    await tick(900); // second PUT sent before the first returns
    await tick(3000);
    expect(reqs.map((r) => r.body.rev)).toEqual([1, 2]);
    expect(container.textContent).not.toContain("Changed in another tab");
  });
});

describe("the undo history in the view", () => {
  it("does not save or add a step when a commit changes nothing", async () => {
    const reqs: unknown[] = [];
    vi.stubGlobal("fetch", async (_u: string, init: RequestInit) => {
      reqs.push(init.body);
      return new Response(JSON.stringify({ rev: 2 }), { status: 200 });
    });
    const d = addToMain(emptyDoc(), { url: "a.png", kind: "image" }).doc;
    render(
      <CutView
        projectId="44444444-4444-4444-8444-444444444444"
        title="t"
        isGuest={false}
        initialMessages={[]}
        saved={{ id: "e", rev: 1, doc: d }}
        run={null}
      />
    );
    await tick(10);
    await act(async () => {
      h.onChange?.(h.last as TimelineDoc, true);
    });
    await tick(1500);
    expect(reqs).toHaveLength(0);
  });
});
