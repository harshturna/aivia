"use client";

import {
  Image as ImageIcon,
  LayoutGrid,
  Plus,
  Search,
  Users,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { Composer } from "@/components/studio/composer";
import { RunDemo } from "@/components/studio/run-demo";
import { Skeleton } from "@/components/ui/skeleton";
import { CLIPS, STILLS, TRACKS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";
import { H2, LEDE, WRAP } from "./type";

/**
 * The Studio, shown running (design §11.4): the product's frame with a presentational
 * sidebar and the replayed run, the composer at its foot.
 */
const NAV = [
  { label: "Studio", icon: ImageIcon, on: true },
  { label: "Library", icon: LayoutGrid },
  { label: "Edit", icon: Wand2 },
  { label: "Characters", icon: Users },
];
const RECENT = [
  "A forest older than memory",
  "Owl over a frozen lake",
  "Quiet piano record, album art",
  "Dawn chorus by a stream",
];

/**
 * Keeps the newest output in view as the replay adds it, the way a session follows its run.
 * The area is not scrollable by hand (TICKET-033): the wheel always belongs to the page.
 */
function useFollow() {
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = area.current;
    const inner = content.current;
    if (!el || !inner) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ro = new ResizeObserver(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: still ? "auto" : "smooth",
      });
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);
  return { area, content };
}

export function StudioDemo() {
  const { area, content } = useFollow();
  const [done, setDone] = useState(false);
  return (
    <section className={WRAP}>
      <h2 className={H2}>It plans the work, then does it.</h2>
      <p className={LEDE}>
        Aivia writes the steps before it spends a thing, then makes each piece
        in front of you. Then cut them into one film on a timeline: trim,
        reorder, retitle, and export.
      </p>

      {/* a fixed frame: the run scrolls inside it, so nothing around it grows */}
      <div className="mt-12 h-[620px] overflow-hidden rounded-window border border-border bg-surface shadow-float md:h-[720px]">
        {/* one explicit column on a phone: the run cannot widen the frame (TICKET-055) */}
        <div className="grid h-full grid-cols-[minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_200px]">
          <aside
            aria-hidden
            className="hidden flex-col gap-5 border-r border-border px-3 py-4 text-[13px] md:flex"
          >
            <div className="px-2">
              <Logo className="text-[18px]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex h-8 items-center gap-2.5 rounded-control px-2 text-fg-2">
                <Plus className="size-4" /> New project
                <span className="ml-auto text-[11px] text-mute">⌘⇧O</span>
              </div>
              <div className="flex h-8 items-center gap-2.5 rounded-control px-2 text-fg-2">
                <Search className="size-4" /> Search
                <span className="ml-auto text-[11px] text-mute">⌘K</span>
              </div>
            </div>
            <div className="space-y-0.5">
              {NAV.map(({ label, icon: Icon, on }) => (
                <div
                  key={label}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-control px-2 font-medium",
                    on ? "bg-surface-3 text-fg" : "text-fg-2"
                  )}
                >
                  <Icon className="size-4" /> {label}
                </div>
              ))}
            </div>
            <div>
              <div className="px-2 pb-1 text-[12px] text-mute">Projects</div>
              {RECENT.map((r, i) => (
                <div
                  key={r}
                  className={cn(
                    "flex h-8 items-center gap-2.5 truncate rounded-control px-2",
                    i === 0 ? "text-fg" : "text-fg-2"
                  )}
                >
                  {i === 0 && !done && (
                    <span className="size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-fg border-r-transparent" />
                  )}
                  <span className="truncate">{r}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto space-y-3 px-2">
              <div>
                <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={cn(
                      "h-full bg-fg transition-[width] duration-500",
                      done ? "w-3/5" : "w-2/5"
                    )}
                  />
                </div>
                <div className="tabular mt-1.5 text-[12px] text-mute">
                  {done ? 3 : 2} of 5 generations
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-fg text-[11px] font-medium text-bg">
                  M
                </span>
                <span className="leading-tight">
                  <span className="block font-medium">Maya</span>
                  <span className="block text-[11.5px] text-mute">
                    Free plan
                  </span>
                </span>
              </div>
            </div>
          </aside>

          <div className="relative flex h-full min-h-0 flex-col">
            <div className="flex h-13 items-center gap-3 border-b border-border px-6 text-[15px] font-medium">
              A forest older than memory
              {!done && (
                <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-fg-2">
                  <span className="size-1.5 rounded-full bg-sun" /> Running
                </span>
              )}
              <span className="ml-auto text-[13px] font-normal text-mute">
                Rename
              </span>
            </div>
            <div
              ref={area}
              className="min-h-0 flex-1 overflow-hidden px-6 py-6 [mask-image:linear-gradient(to_bottom,transparent,black_28px)] md:px-10"
            >
              <div ref={content}>
                <RunDemo className="mx-auto max-w-[720px]" onDone={setDone} />
              </div>
            </div>
            {/* a picture of the composer, not a working one: out of the tab order */}
            <div className="shrink-0 px-6 pb-5 pt-2 md:px-10" inert>
              <Composer
                className="mx-auto max-w-[720px]"
                onSubmit={() => {}}
                cost="1 generation"
              />
            </div>
          </div>
          {/* the project's media, as the tray shows it (TICKET-063) */}
          <aside
            aria-hidden
            className="hidden flex-col gap-3 border-l border-border px-3 py-4 text-[13px] xl:flex"
          >
            <div className="px-1 font-medium">Media</div>
            <div className="truncate px-1 text-[12px] text-mute">
              A poster, a short teaser and a soundtrack
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {done ? (
                <>
                  {/* biome-ignore lint/performance/noImgElement: a thumbnail in a picture of the app */}
                  <img
                    src={STILLS[0].src}
                    alt=""
                    className="aspect-square rounded-control object-cover"
                  />
                  {/* biome-ignore lint/performance/noImgElement: as above */}
                  <img
                    src={CLIPS[0].poster}
                    alt=""
                    className="aspect-square rounded-control object-cover"
                  />
                  <div className="col-span-2 flex h-9 items-center gap-2 truncate rounded-control bg-surface-2 px-2.5 text-[12px] text-fg-2">
                    <span aria-hidden>♪</span>
                    <span className="truncate">{TRACKS[0].title}</span>
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="aspect-square rounded-control" />
                  <Skeleton className="aspect-square rounded-control" />
                  <Skeleton className="col-span-2 h-9 rounded-control" />
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
