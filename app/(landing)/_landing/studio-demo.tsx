"use client";

import {
  Image as ImageIcon,
  LayoutGrid,
  Plus,
  Search,
  Users,
  Wand2,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Composer } from "@/components/studio/composer";
import { RunDemo } from "@/components/studio/run-demo";
import { cn } from "@/lib/utils";

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
  "Night market teaser",
  "Poster series for the bakery",
  "Rain on a tin roof",
  "Quiet piano record, album art",
];

export function StudioDemo() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 sm:px-8">
      <h2 className="max-w-[22ch] text-[clamp(32px,4vw,48px)] font-medium leading-[1.05] tracking-[-0.02em] [text-wrap:balance]">
        One line in. A plan, then the work.
      </h2>
      <p className="mt-4 max-w-[52ch] text-[16px] leading-6 text-fg-2">
        Aivia writes the steps before it spends anything, then runs them. Watch
        each one land.
      </p>

      <div className="mt-10 overflow-hidden rounded-window border border-border bg-surface shadow-float">
        <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
          <aside
            aria-hidden
            className="hidden flex-col gap-5 border-r border-border px-3 py-4 text-[13px] md:flex"
          >
            <div className="px-2">
              <Logo className="text-[18px]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex h-8 items-center gap-2.5 rounded-control px-2 text-fg-2">
                <Plus className="size-4" /> New session
                <span className="ml-auto text-[11px] text-faint">⌘N</span>
              </div>
              <div className="flex h-8 items-center gap-2.5 rounded-control px-2 text-fg-2">
                <Search className="size-4" /> Search
                <span className="ml-auto text-[11px] text-faint">⌘K</span>
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
              <div className="px-2 pb-1 text-[12px] text-mute">Recent</div>
              {RECENT.map((r, i) => (
                <div
                  key={r}
                  className={cn(
                    "flex h-8 items-center gap-2.5 truncate rounded-control px-2",
                    i === 0 ? "text-fg" : "text-fg-2"
                  )}
                >
                  {i === 0 && (
                    <span className="size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-fg border-r-transparent" />
                  )}
                  <span className="truncate">{r}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto space-y-3 px-2">
              <div>
                <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full w-1/3 bg-white" />
                </div>
                <div className="tabular mt-1.5 text-[12px] text-mute">
                  34 of 100 generations
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-white text-[11px] font-medium text-black">
                  H
                </span>
                <span className="leading-tight">
                  <span className="block font-medium">harsh</span>
                  <span className="block text-[11.5px] text-mute">
                    Free plan
                  </span>
                </span>
              </div>
            </div>
          </aside>

          <div className="relative flex min-h-[560px] flex-col">
            <div className="flex h-13 items-center gap-3 border-b border-border px-6 text-[15px] font-medium">
              Night market teaser
              <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-fg-2">
                <span className="size-1.5 rounded-full bg-white" /> Running
              </span>
              <span className="ml-auto text-[13px] font-normal text-mute">
                Rename
              </span>
            </div>
            <div className="flex-1 px-6 py-6 md:px-10">
              <RunDemo className="mx-auto max-w-[720px]" />
            </div>
            <div className="sticky bottom-0 px-6 pb-5 md:px-10">
              <Composer
                className="mx-auto max-w-[720px]"
                onSubmit={() => {}}
                cost="1 generation"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
