"use client";

import { Check, ChevronDown, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AmbientVideo } from "@/components/studio/ambient-video";
import { AudioRow } from "@/components/studio/audio-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { CLIPS, STILLS, TRACKS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

/**
 * A run, replayed (design §11.4): the prompt, the steps ticking, the poster revealing, the
 * clip arriving, the track, the notes. Fixed data on a timer, started once when it scrolls
 * into view; a replay control runs it again. The Studio ticket swaps the body for the real
 * run component fed by a recorded stream; the look is the same.
 */
const PROMPT =
  "A poster, a ten-second teaser and a soundtrack for a forest older than memory. Keep it quiet.";

const STEPS = [
  "Look up old-growth forest photography for reference",
  "Generate the poster, 3:4",
  "Generate a 10 s clip of a waterfall in a mossy canyon",
  "Compose 30 s of slow ambient strings",
  "Write three taglines",
];

/** Milestones in ms from start: which step is running, which outputs exist. */
const TIMELINE: Array<{ at: number; step: number; outputs: number }> = [
  { at: 0, step: -1, outputs: 0 },
  { at: 600, step: 0, outputs: 0 },
  { at: 1500, step: 1, outputs: 0 },
  { at: 2600, step: 2, outputs: 1 },
  { at: 4400, step: 3, outputs: 2 },
  { at: 5600, step: 4, outputs: 3 },
  { at: 6600, step: 5, outputs: 4 },
];
const TOTAL = 7200;

export function RunDemo({ className }: { className?: string }) {
  const [phase, setPhase] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(true);
  const [, setStarted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const play = () => {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
    setPhase(0);
    setElapsed(0);
    setStepsOpen(true);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setPhase(TIMELINE.length - 1);
      setElapsed(41);
      setStepsOpen(false);
      return;
    }
    TIMELINE.forEach((m, i) => {
      timers.current.push(window.setTimeout(() => setPhase(i), m.at));
    });
    timers.current.push(window.setTimeout(() => setStepsOpen(false), TOTAL));
    const t0 = Date.now();
    const tick = window.setInterval(() => {
      const s = Math.min(41, Math.round(((Date.now() - t0) / TOTAL) * 41));
      setElapsed(s);
      if (Date.now() - t0 >= TOTAL) clearInterval(tick);
    }, 250);
    timers.current.push(tick as unknown as number);
  };

  // Start once, when the frame scrolls into view. The timers live for the component's
  // life and are cleared only on unmount (a cleanup keyed on state would cancel a replay
  // the moment it started).
  // biome-ignore lint/correctness/useExhaustiveDependencies: observe once
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          play();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(
    () => () => {
      for (const id of timers.current) clearTimeout(id);
    },
    []
  );

  const m = TIMELINE[phase];
  const done = phase === TIMELINE.length - 1;
  const doneSteps = m.step < 0 ? 0 : Math.min(m.step, STEPS.length);

  return (
    <div ref={root} className={cn("relative", className)}>
      <div className="flex items-start justify-between gap-6">
        <p className="text-[14px] leading-6 text-fg-2">{PROMPT}</p>
        <span className="tabular shrink-0 pt-0.5 text-[12px] text-mute">
          12:04
        </span>
      </div>

      {m.step >= 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setStepsOpen((o) => !o)}
            aria-expanded={stepsOpen}
            className="inline-flex items-center gap-2 rounded-control text-[13px] text-fg-2 transition-colors hover:text-fg"
          >
            {!done ? (
              <Spinner className="size-3" />
            ) : (
              <Check className="size-3.5 text-good" />
            )}
            <span>
              Steps {STEPS.length}
              <span className="text-mute"> · </span>
              {done ? "done" : `${doneSteps} done`}
            </span>
            {!done && (
              <span className="tabular text-mute">
                0:{String(elapsed).padStart(2, "0")}
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-3.5 text-mute transition-transform duration-150",
                stepsOpen && "rotate-180"
              )}
            />
          </button>
          {stepsOpen && (
            <ol className="mt-2 space-y-1 border-l border-border pl-4">
              {STEPS.map((step, i) => {
                const state =
                  i < m.step
                    ? "done"
                    : i === m.step && !done
                      ? "running"
                      : "queued";
                return (
                  <li
                    key={step}
                    className="flex items-center gap-3 text-[13px] leading-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
                    style={{
                      animationDelay: `${i * 60}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <span className="tabular w-3 text-right text-[12px] text-mute">
                      {i + 1}
                    </span>
                    <span
                      className={state === "queued" ? "text-mute" : "text-fg-2"}
                    >
                      {step}
                    </span>
                    <span className="ml-auto text-[12px] text-mute">
                      {state === "done" && (
                        <Check className="size-3.5 text-good" />
                      )}
                      {state === "running" && <Spinner className="size-3" />}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {m.outputs > 0 && (
        <div className="mt-5 grid grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-3">
          <Output
            show={m.outputs >= 1}
            ready={m.outputs >= 2}
            ratio="3/4"
            label="the poster, one ancient tree above the mist"
          >
            <Image
              src={STILLS[0].src}
              alt="Poster: one ancient tree on a hill above morning mist"
              width={STILLS[0].width}
              height={STILLS[0].height}
              sizes="320px"
              className="size-full object-cover"
            />
          </Output>
          <Output
            show={m.outputs >= 2}
            ready={m.outputs >= 3}
            ratio="16/9"
            label="a waterfall in a mossy canyon, 10 s"
          >
            <AmbientVideo
              src={CLIPS[0].src}
              poster={CLIPS[0].poster}
              className="size-full object-cover"
            />
          </Output>
        </div>
      )}
      {m.outputs >= 3 && (
        <div className="mt-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
          <AudioRow
            src={TRACKS[0].src}
            title={TRACKS[0].title}
            subtitle={TRACKS[0].prompt}
            seconds={30}
          />
        </div>
      )}
      {m.outputs >= 4 && (
        <div className="mt-5 max-w-[68ch] text-[15px] leading-6 text-fg animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
          <p>Three taglines, in the same quiet register as the poster:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-fg-2">
            <li>Older than every map.</li>
            <li>Walk in before the world wakes.</li>
            <li>The light still finds its way down.</li>
          </ol>
        </div>
      )}

      {done && (
        <button
          type="button"
          onClick={play}
          className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-mute transition-colors hover:text-fg"
        >
          <RotateCcw className="size-3.5" /> Replay
        </button>
      )}
    </div>
  );
}

function Output({
  show,
  ready,
  ratio,
  label,
  children,
}: {
  show: boolean;
  ready: boolean;
  ratio: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!show) return <div />;
  return (
    <figure className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      {ready ? (
        <div
          className="overflow-hidden rounded-media bg-surface animate-in fade-in-0 duration-500"
          style={{ aspectRatio: ratio }}
        >
          {children}
        </div>
      ) : (
        <Skeleton
          className="flex items-end p-3 text-[12.5px] leading-4 text-mute"
          style={{ aspectRatio: ratio }}
        >
          {label}
        </Skeleton>
      )}
      <figcaption className="mt-1.5 text-[12px] leading-4 text-mute">
        {label}
      </figcaption>
    </figure>
  );
}
