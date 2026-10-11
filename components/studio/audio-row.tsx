"use client";

import { Download, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A music or sound output (design §5.3): play, the title, a waveform drawn from the decoded
 * audio, the duration, download. The waveform is decorative; the row is the control.
 */
const BARS = 56;

let current: HTMLAudioElement | null = null;

function useWaveform(src: string) {
  const [peaks, setPeaks] = useState<number[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const buffer = await (await fetch(src)).arrayBuffer();
        const context = new AudioContext();
        const audio = await context.decodeAudioData(buffer);
        const data = audio.getChannelData(0);
        const step = Math.floor(data.length / BARS);
        const out: number[] = [];
        for (let i = 0; i < BARS; i++) {
          let sum = 0;
          for (let j = 0; j < step; j += 16)
            sum += Math.abs(data[i * step + j]);
          out.push(sum / (step / 16));
        }
        const max = Math.max(...out) || 1;
        if (!cancelled) setPeaks(out.map((v) => Math.max(0.08, v / max)));
        await context.close();
      } catch {
        if (!cancelled) setPeaks(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);
  return peaks;
}

function format(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function AudioRow({
  src,
  title,
  subtitle,
  seconds,
  className,
}: {
  src: string;
  title: string;
  subtitle?: string;
  seconds: number;
  className?: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const peaks = useWaveform(src);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    // one thing plays at a time
    if (current && current !== el) current.pause();
    current = el;
    el.play().catch(() => {});
  };

  return (
    <div
      className={cn(
        "flex h-14 items-center gap-3 rounded-media border border-border bg-surface pl-2 pr-3",
        className
      )}
    >
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setProgress(0)}
        onTimeUpdate={(event) => {
          const el = event.currentTarget;
          setProgress(el.duration ? el.currentTime / el.duration : 0);
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black transition-transform active:scale-[.96]"
      >
        {playing ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 translate-x-px fill-current" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-[18px]">
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-[12px] leading-4 text-mute">
            {subtitle}
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="hidden h-6 w-[140px] shrink-0 items-center gap-px sm:flex"
      >
        {(peaks ?? Array.from({ length: BARS }, () => 0.2)).map((p, i) => (
          <i
            // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional
            key={i}
            className={cn(
              "block flex-1 rounded-[1px] transition-colors duration-150",
              i / BARS < progress ? "bg-fg" : "bg-fg/30"
            )}
            style={{ height: `${Math.round(p * 24)}px` }}
          />
        ))}
      </div>
      <span className="tabular w-9 shrink-0 text-right text-[12px] text-mute">
        {format(seconds)}
      </span>
      <a
        href={src}
        download
        aria-label={`Download ${title}`}
        className="grid size-8 shrink-0 place-items-center rounded-control text-mute transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Download className="size-4" />
      </a>
    </div>
  );
}
