"use client";

import {
  Film,
  Music,
  Play,
  Scissors,
  Type,
  Undo2,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CLIPS, STILLS, TRACKS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

/**
 * The Studio frame's second half (D-005 §17.10, TICKET-078): the run's pieces laid on the cut's
 * timeline, the way Cut shows them. The pieces land one by one, the still is trimmed, the
 * playhead plays it through. With reduced motion it is the finished cut, still.
 */
const LANES = [
  { label: "Words", icon: Type },
  { label: "Picture", icon: Film },
  { label: "Score", icon: Music },
  { label: "Sound", icon: Volume2 },
] as const;

export function CutScene() {
  const clip = CLIPS[0];
  const still = STILLS.find((s) => s.src.includes("tree")) ?? STILLS[0];
  // the forest's title card, as the run wrote it
  const words = "Older than every map.";
  // 0: empty lanes; 1..3: pieces land; 4: the still trimmed; 5: playing
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(5);
      return;
    }
    const timers = [250, 600, 950, 1700, 2300].map((ms, i) =>
      window.setTimeout(() => setStep(i + 1), ms)
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);
  const land = (at: number) =>
    cn(
      "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
      step >= at ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* the stage */}
      <div className="grid min-h-0 flex-1 place-items-center bg-bg/40 p-4 md:p-6">
        <div className="relative aspect-video h-full max-h-full max-w-full overflow-hidden rounded-media bg-bg shadow-float">
          {/* biome-ignore lint/performance/noImgElement: a frame in a picture of the app */}
          <img
            src={clip.poster}
            alt=""
            className={cn(
              "size-full object-cover transition-opacity duration-700",
              step >= 2 ? "opacity-100" : "opacity-0"
            )}
          />
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[clamp(18px,2.4vw,30px)] text-fg [text-shadow:0_2px_16px_var(--color-bg)]">
            {words}
          </p>
        </div>
      </div>
      {/* the controls */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-t border-border px-4 text-[13px] text-fg-2">
        <Play className="size-4 fill-current" />
        <span className="tabular">
          {step >= 5 ? "0:04.2" : "0:00.0"} / 0:09.0
        </span>
        <span className="h-4 w-px bg-border" />
        <Scissors className="size-4" />
        <Undo2 className="size-4" />
      </div>
      {/* the timeline */}
      <div className="relative shrink-0 border-t border-border pb-2 text-[12px]">
        <div className="flex h-6 items-end border-b border-border/60 pl-20 text-mute">
          {[0, 2, 4, 6, 8].map((s) => (
            <span key={s} className="tabular w-[20%]">
              0:0{s}
            </span>
          ))}
        </div>
        {LANES.map((lane, i) => (
          <div
            key={lane.label}
            className="flex h-10 items-center border-b border-border/40"
          >
            <span className="flex w-20 shrink-0 items-center gap-1.5 px-3 text-mute">
              <lane.icon className="size-3.5" />
              {lane.label}
            </span>
            <div className="relative h-7 flex-1 pr-4">
              {i === 0 && (
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 flex w-[22%] items-center truncate rounded-control border border-border-strong bg-surface-2 px-2 text-fg-2",
                    land(1)
                  )}
                >
                  {words}
                </div>
              )}
              {i === 1 && (
                <>
                  <div
                    className={cn(
                      "absolute inset-y-0 left-[12%] flex w-[52%] items-center gap-2 overflow-hidden rounded-control border border-border-strong bg-surface-2 pr-2 text-fg",
                      land(2)
                    )}
                  >
                    {/* biome-ignore lint/performance/noImgElement: a frame in a picture of the app */}
                    <img
                      src={clip.poster}
                      alt=""
                      className="h-full aspect-video object-cover"
                    />
                    <span className="truncate">Tall waterfall</span>
                  </div>
                  <div
                    className={cn(
                      "absolute inset-y-0 left-[58%] flex items-center gap-2 overflow-hidden rounded-control border border-border-strong bg-surface-2 pr-2 text-fg transition-[width] duration-700 ease-out motion-reduce:transition-none",
                      step >= 4 ? "w-[34%]" : "w-[40%]",
                      land(3)
                    )}
                  >
                    {/* biome-ignore lint/performance/noImgElement: as above */}
                    <img
                      src={still.src}
                      alt=""
                      className="h-full aspect-video object-cover"
                    />
                    <span className="truncate">Ancient tree</span>
                    {/* the crossfade where the two meet */}
                    <span className="absolute inset-y-0 left-0 w-[14%] bg-linear-to-r from-bg/70 to-transparent" />
                  </div>
                </>
              )}
              {i === 2 && (
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 flex w-[92%] items-center truncate rounded-control border border-border bg-[repeating-linear-gradient(90deg,var(--color-surface-3)_0_2px,transparent_2px_5px)] px-2 text-fg-2",
                    land(3)
                  )}
                >
                  {TRACKS[0]?.title}
                </div>
              )}
            </div>
          </div>
        ))}
        {/* the playhead, playing the cut through */}
        <span
          aria-hidden
          className={cn(
            "absolute top-0 bottom-0 w-px bg-sun",
            step >= 5
              ? "left-[calc(5rem+46%)] transition-[left] duration-[6000ms] ease-linear motion-reduce:transition-none"
              : "left-20"
          )}
        />
      </div>
    </div>
  );
}
