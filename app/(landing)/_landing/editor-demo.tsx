"use client";

import {
  ArrowLeft,
  Crop as CropIcon,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { STILLS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";
import { H2, LEDE, WRAP } from "./type";

/**
 * The image editor, shown working (D-005 §17.10, TICKET-067): a still cropped to a poster's
 * shape, warmed, and given its words, once, when it comes into view. With reduced motion it is
 * the finished poster.
 */
const STEPS = [
  { label: "Crop", icon: CropIcon },
  { label: "Adjust", icon: SlidersHorizontal },
  { label: "Text", icon: Type },
] as const;
const AT = [600, 2100, 3600];
// the still is 2:3; a 3:4 crop keeps its width and trims this much top and bottom
const TRIM = `${((1 - (2 / 3) * (4 / 3)) / 2) * 100}%`;

export function EditorDemo() {
  const still = STILLS.find((s) => s.src.includes("tree")) ?? STILLS[0];
  const frame = useRef<HTMLDivElement>(null);
  // 0: the still as it came; 1: cropped; 2: warmed; 3: with its words
  const [step, setStep] = useState(0);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(3);
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        for (const [i, ms] of AT.entries())
          timers.push(window.setTimeout(() => setStep(i + 1), ms));
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      for (const t of timers) clearTimeout(t);
    };
  }, []);
  const tool = Math.max(0, step - 1);

  return (
    <section className={WRAP}>
      <h2 className={H2}>Then make a still into a poster.</h2>
      <p className={LEDE}>
        Crop it to a poster's shape, warm it up, and set your words on it. Each
        change can be undone, and the original stays as it was, beside the new
        version.
      </p>

      <div
        ref={frame}
        aria-hidden
        className="mt-12 overflow-hidden rounded-window border border-border bg-surface shadow-float"
      >
        <div className="flex h-12 items-center gap-3 border-b border-border px-4 text-[14px] font-medium">
          <ArrowLeft className="size-4 text-fg-2" />
          <span className="truncate">Editing “one ancient tree”</span>
          <span
            className={cn(
              "ml-auto rounded-control px-3 py-1 text-[13px] transition-colors duration-500",
              step === 3 ? "bg-fg text-bg" : "bg-surface-3 text-mute"
            )}
          >
            Save
          </span>
        </div>

        <div className="grid h-[420px] place-items-center bg-bg/40 p-6 md:h-[520px]">
          <div className="relative aspect-[2/3] h-full">
            <div
              className="absolute inset-0 overflow-hidden rounded-media transition-[clip-path] duration-700 ease-out motion-reduce:transition-none"
              style={{
                clipPath:
                  step >= 2
                    ? `inset(${TRIM} 0 ${TRIM} 0 round 12px)`
                    : "inset(0 0 0 0 round 12px)",
              }}
            >
              <Image
                src={still.src}
                alt=""
                width={still.width}
                height={still.height}
                sizes="360px"
                className="size-full object-cover transition-[filter] duration-700 motion-reduce:transition-none"
                style={{
                  filter:
                    step >= 2
                      ? "sepia(0.22) saturate(1.18) brightness(1.04)"
                      : "none",
                }}
              />
              <p
                className={cn(
                  "absolute inset-x-[4%] top-[10%] text-center font-display whitespace-nowrap text-[clamp(19px,2.2vw,30px)] font-medium leading-[1.05] text-bg transition-[opacity,transform] duration-700 motion-reduce:transition-none",
                  step >= 3
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                )}
              >
                Older than every map.
              </p>
            </div>
            {/* the crop box, closing on the poster's shape, gone once applied */}
            <div
              className={cn(
                "absolute inset-x-0 border-2 border-fg transition-[top,bottom,opacity] duration-700 ease-out motion-reduce:transition-none",
                step >= 2 || step === 0 ? "opacity-0" : "opacity-100"
              )}
              style={{
                top: step >= 1 ? TRIM : "0%",
                bottom: step >= 1 ? TRIM : "0%",
                boxShadow:
                  "0 0 0 9999px color-mix(in srgb, var(--color-bg) 55%, transparent)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border px-4 py-3 text-[13px]">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <span
                key={s.label}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-control px-3 font-medium transition-colors duration-300",
                  step > 0 && tool === i ? "bg-surface-3 text-fg" : "text-fg-2"
                )}
              >
                <s.icon className="size-4" /> {s.label}
              </span>
            ))}
          </div>
          <span className="text-fg-2">
            {step <= 1
              ? "Shape: 3:4"
              : step === 2
                ? "Warmth +40, saturation +18"
                : "Words in ink, over the sky"}
          </span>
        </div>
      </div>
    </section>
  );
}
