"use client";

import { useRef } from "react";
import { moveCrop, resizeCrop } from "@/lib/image-edit/geometry";
import type { Crop } from "@/lib/image-edit/schema";

/**
 * The crop over the whole turned picture (TICKET-067): drag inside to move it, a corner to size
 * it (a fixed shape keeps its ratio), or focus it and use the arrow keys (with Shift, to size).
 */
type Corner = "nw" | "ne" | "sw" | "se";
const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];

export function CropBox({
  crop,
  size,
  onChange,
}: {
  crop: Crop;
  /** The turned picture's pixels: a fixed shape's ratio is in pixels, the box in fractions. */
  size: { width: number; height: number };
  onChange: (crop: Crop, commit: boolean) => void;
}) {
  const area = useRef<HTMLDivElement>(null);
  const gesture = useRef<
    | { kind: "move"; x0: number; y0: number; start: Crop; last: Crop }
    | { kind: Corner; start: Crop; last: Crop }
    | null
  >(null);

  const point = (clientX: number, clientY: number) => {
    const r = area.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  };
  const end = () => {
    const g = gesture.current;
    gesture.current = null;
    if (g) onChange(g.last, true);
  };

  return (
    <div ref={area} className="absolute inset-0 touch-none overflow-hidden">
      <button
        type="button"
        aria-label="Crop. Arrow keys move it; with Shift they change its size."
        className="absolute cursor-move border-2 border-fg outline-offset-4"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
          boxShadow:
            "0 0 0 9999px color-mix(in srgb, var(--color-bg) 62%, transparent)",
        }}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const p = point(event.clientX, event.clientY);
          gesture.current = {
            kind: "move",
            x0: p.x,
            y0: p.y,
            start: crop,
            last: crop,
          };
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (!g) return;
          const p = point(event.clientX, event.clientY);
          const next =
            g.kind === "move"
              ? moveCrop(g.start, p.x - g.x0, p.y - g.y0)
              : resizeCrop(g.start, g.kind, p, size);
          g.last = next;
          onChange(next, false);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(event) => {
          const step = 0.01;
          const d = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
          }[event.key];
          if (!d) return;
          event.preventDefault();
          onChange(
            event.shiftKey
              ? resizeCrop(
                  crop,
                  "se",
                  {
                    x: crop.x + crop.width + d[0],
                    y: crop.y + crop.height + d[1],
                  },
                  size
                )
              : moveCrop(crop, d[0], d[1]),
            true
          );
        }}
      >
        {/* thirds, to compose by */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-fg/30"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-fg/30"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-fg/30"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-fg/30"
        />
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className="absolute grid size-11 place-items-center"
            style={{
              [corner.includes("n") ? "top" : "bottom"]: -22,
              [corner.includes("w") ? "left" : "right"]: -22,
              cursor:
                corner === "nw" || corner === "se"
                  ? "nwse-resize"
                  : "nesw-resize",
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              event.currentTarget.parentElement?.setPointerCapture(
                event.pointerId
              );
              gesture.current = { kind: corner, start: crop, last: crop };
            }}
          >
            <span className="size-3.5 rounded-sm border-2 border-bg bg-fg" />
          </span>
        ))}
      </button>
    </div>
  );
}
