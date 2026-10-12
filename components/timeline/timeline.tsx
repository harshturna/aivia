"use client";

import { Film, Image as ImageIcon, Music, Type, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDuration } from "@/lib/duration";
import type { MediaItem } from "@/lib/media";
import { mainFades } from "@/lib/timeline/layout";
import {
  moveFree,
  moveMain,
  snap,
  snapTargets,
  trimEnd,
  trimStart,
} from "@/lib/timeline/ops";
import {
  docDuration,
  endOf,
  type Item,
  type TimelineDoc,
  type Track,
} from "@/lib/timeline/schema";
import { cn } from "@/lib/utils";

/**
 * The timeline (D-005 §17.5, TICKET-065): a ruler, the playhead, and four rows: text, picture
 * (the magnetic main track), score and sound. Items are dragged, trimmed by their edges and
 * selected with the pointer; every gesture previews live and lands as one undo step. Times
 * snap to the playhead and every edge (8 px), else to the frame grid; Alt turns snapping off.
 */
const ROWS: Array<{
  key: string;
  label: string;
  height: number;
  icon: typeof Type;
}> = [
  { key: "text", label: "Text", height: 36, icon: Type },
  { key: "main", label: "Picture", height: 60, icon: Film },
  { key: "score", label: "Score", height: 40, icon: Music },
  { key: "sound", label: "Sound", height: 40, icon: Volume2 },
];
const GUTTER = 84;
const SNAP_PX = 8;

function rowOf(track: Track) {
  return track.kind === "audio" ? track.role : track.kind;
}

type Drag =
  | {
      kind: "move";
      id: string;
      x0: number;
      doc0: TimelineDoc;
      start0: number;
      main: boolean;
    }
  | {
      kind: "trim-start" | "trim-end";
      id: string;
      x0: number;
      doc0: TimelineDoc;
    }
  | { kind: "scrub" };

export function Timeline({
  doc,
  pxPerSec,
  onZoom,
  selected,
  onSelect,
  onChange,
  onTick,
  onSeek,
  onDropMedia,
  labelOf,
}: {
  doc: TimelineDoc;
  pxPerSec: number;
  onZoom: (pxPerSec: number, anchorMs?: number) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** `commit` false while a gesture is live; true when it lands (one undo step). */
  onChange: (doc: TimelineDoc, commit: boolean) => void;
  onTick: (f: (ms: number) => void) => () => void;
  onSeek: (ms: number) => void;
  /** A piece dropped from the tray, at a time, on a row. */
  onDropMedia: (item: MediaItem, ms: number, row: string) => void;
  labelOf: (item: Item) => string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const playhead = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [snapLine, setSnapLine] = useState<number | null>(null);
  const px = pxPerSec / 1000;
  const length = docDuration(doc);
  const width = Math.max((length + 4000) * px, 400);

  // the playhead follows the clock by transform, not by re-rendering
  useEffect(
    () =>
      onTick((ms) => {
        if (playhead.current)
          playhead.current.style.transform = `translateX(${ms * px}px)`;
      }),
    [onTick, px]
  );

  const msAt = useCallback(
    (clientX: number) => {
      const el = scroller.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return Math.max(0, (clientX - r.left - GUTTER + el.scrollLeft) / px);
    },
    [px]
  );

  const timeOfPlayhead = () => {
    const t = playhead.current?.style.transform.match(
      /translateX\(([-\d.]+)px\)/
    );
    return t ? Number(t[1]) / px : 0;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "scrub") {
      onSeek(msAt(event.clientX));
      return;
    }
    const dx = (event.clientX - d.x0) / px;
    const threshold = event.altKey ? 0 : SNAP_PX / px;
    const targets = snapTargets(d.doc0, timeOfPlayhead(), d.id);
    const hit = d.doc0.tracks
      .flatMap((t) => t.items as Item[])
      .find((i) => i.id === d.id);
    if (!hit) return;
    if (d.kind === "move") {
      if (d.main) {
        // reorder: the item goes where its centre now falls among the others
        const main = d.doc0.tracks.find((t) => t.kind === "main");
        if (main?.kind !== "main") return;
        const centre = d.start0 + dx + hit.duration / 2;
        const others = main.items.filter((i) => i.id !== d.id);
        const index = others.filter(
          (i) => i.start + i.duration / 2 < centre
        ).length;
        onChange(moveMain(d.doc0, d.id, index), false);
        setSnapLine(null);
      } else {
        const start = snap(d.start0 + dx, targets, threshold, d.doc0.fps);
        const end = snap(
          d.start0 + dx + hit.duration,
          targets,
          threshold,
          d.doc0.fps
        );
        const useEnd =
          Math.abs(end - (d.start0 + dx + hit.duration)) <
          Math.abs(start - (d.start0 + dx));
        const s = useEnd ? end - hit.duration : start;
        setSnapLine(
          targets.includes(useEnd ? end : start) ? (useEnd ? end : start) : null
        );
        onChange(moveFree(d.doc0, d.id, s), false);
      }
    } else if (d.kind === "trim-start") {
      const edge = snap(hit.start + dx, targets, threshold, d.doc0.fps);
      setSnapLine(targets.includes(edge) ? edge : null);
      onChange(trimStart(d.doc0, d.id, edge - hit.start), false);
    } else {
      const edge = snap(endOf(hit) + dx, targets, threshold, d.doc0.fps);
      setSnapLine(targets.includes(edge) ? edge : null);
      onChange(trimEnd(d.doc0, d.id, edge - endOf(hit)), false);
    }
  };

  const endGesture = () => {
    const d = drag.current;
    drag.current = null;
    setSnapLine(null);
    if (d && d.kind !== "scrub") onChange(doc, true);
  };

  const begin = (event: React.PointerEvent, d: Drag) => {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    scroller.current?.setPointerCapture?.(event.pointerId);
    drag.current = d;
  };

  // ⌘ or Ctrl with the wheel (a pinch on a trackpad) zooms around the pointer
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const anchor = msAt(event.clientX);
      onZoom(
        Math.max(
          8,
          Math.min(400, pxPerSec * (event.deltaY < 0 ? 1.15 : 1 / 1.15))
        ),
        anchor
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [msAt, onZoom, pxPerSec]);

  // ruler ticks: a label every second or every few, as the zoom allows
  const ticks = useMemo(() => {
    const step =
      pxPerSec >= 60 ? 1 : pxPerSec >= 25 ? 2 : pxPerSec >= 12 ? 5 : 10;
    const out: number[] = [];
    for (let s = 0; s * 1000 <= length + 4000; s += step) out.push(s);
    return out;
  }, [pxPerSec, length]);

  const rows = ROWS.map((row) => ({
    ...row,
    track: doc.tracks.find((t) => rowOf(t) === row.key),
  }));

  return (
    <div className="flex h-full min-h-0 select-none flex-col border-t border-border bg-bg">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer gestures; the keyboard path is the Cut view's shortcuts */}
      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain [touch-action:pan-x]"
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("application/x-aivia-media"))
            event.preventDefault();
        }}
        onDrop={(event) => {
          const raw = event.dataTransfer.getData("application/x-aivia-media");
          if (!raw) return;
          event.preventDefault();
          const rowEl = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-row]"
          );
          try {
            onDropMedia(
              JSON.parse(raw) as MediaItem,
              msAt(event.clientX),
              rowEl?.dataset.row ?? "main"
            );
          } catch {}
        }}
      >
        <div className="relative" style={{ width: width + GUTTER }}>
          {/* the ruler: press or drag to move the playhead */}
          <div
            className="sticky top-0 z-20 flex h-7 border-b border-border bg-bg"
            onPointerDown={(event) => {
              begin(event, { kind: "scrub" });
              onSeek(msAt(event.clientX));
            }}
          >
            <div className="sticky left-0 z-10 w-[84px] shrink-0 bg-bg" />
            <div className="relative flex-1 cursor-ew-resize">
              {ticks.map((s) => (
                <span
                  key={s}
                  className={`tabular absolute top-1.5 text-[11px] text-mute ${s === 0 ? "ml-1" : "-translate-x-1/2"}`}
                  style={{ left: s * 1000 * px }}
                >
                  {formatDuration(s)}
                </span>
              ))}
            </div>
          </div>

          {rows.map((row) => (
            <div
              key={row.key}
              data-row={row.key}
              className="relative flex border-b border-border/60"
              style={{ height: row.height + 12 }}
            >
              <div className="sticky left-0 z-10 flex w-[84px] shrink-0 items-center gap-1.5 bg-bg px-3 text-[12px] text-mute">
                <row.icon className="size-3.5" />
                {row.label}
              </div>
              <div className="relative flex-1">
                {((row.track?.items ?? []) as Item[]).map((item, index) => {
                  const isMain = row.key === "main";
                  const fades =
                    isMain && row.track?.kind === "main"
                      ? mainFades(row.track.items, index)
                      : {
                          fadeIn: item.fadeIn ?? 0,
                          fadeOut: item.fadeOut ?? 0,
                        };
                  const on = selected === item.id;
                  const label = labelOf(item);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "absolute top-1.5 overflow-hidden rounded-control border text-[12px] transition-colors",
                        on
                          ? "border-fg bg-surface-3 text-fg"
                          : "border-border-strong bg-surface-2 text-fg-2 hover:bg-surface-3",
                        item.type === "audio" &&
                          "bg-[repeating-linear-gradient(90deg,var(--color-surface-3)_0_2px,transparent_2px_5px)]"
                      )}
                      style={{
                        left: item.start * px,
                        width: Math.max(6, item.duration * px),
                        height: row.height,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`${label}, ${formatDuration(item.start / 1000)} to ${formatDuration(endOf(item) / 1000)}`}
                        aria-pressed={on}
                        onClick={() => onSelect(item.id)}
                        onPointerDown={(event) => {
                          onSelect(item.id);
                          begin(event, {
                            kind: "move",
                            id: item.id,
                            x0: event.clientX,
                            doc0: doc,
                            start0: item.start,
                            main: isMain,
                          });
                        }}
                        className="flex size-full cursor-grab items-center gap-1.5 overflow-hidden px-2 text-left active:cursor-grabbing"
                      >
                        {item.type === "image" && (
                          <ImageIcon className="size-3.5 shrink-0 text-mute" />
                        )}
                        <span className="truncate">{label}</span>
                      </button>
                      {/* fades drawn as ramps at the edges */}
                      {fades.fadeIn > 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 bg-linear-to-r from-bg/70 to-transparent"
                          style={{ width: fades.fadeIn * px }}
                        />
                      )}
                      {fades.fadeOut > 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 right-0 bg-linear-to-l from-bg/70 to-transparent"
                          style={{ width: fades.fadeOut * px }}
                        />
                      )}
                      {/* trim handles: a wide hit area, a narrow mark */}
                      {(["trim-start", "trim-end"] as const).map((edge) => (
                        <span
                          key={edge}
                          aria-hidden
                          onPointerDown={(event) => {
                            onSelect(item.id);
                            begin(event, {
                              kind: edge,
                              id: item.id,
                              x0: event.clientX,
                              doc0: doc,
                            });
                          }}
                          className={cn(
                            "absolute inset-y-0 z-10 w-3 cursor-ew-resize [touch-action:none]",
                            edge === "trim-start" ? "left-0" : "right-0",
                            "after:absolute after:inset-y-2 after:w-0.5 after:rounded-full after:bg-fg/0 hover:after:bg-fg/70",
                            edge === "trim-start"
                              ? "after:left-1"
                              : "after:right-1",
                            on && "after:bg-fg/50"
                          )}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* the playhead and a snap mark */}
          <div
            ref={playhead}
            aria-hidden
            className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-sun"
            style={{ left: GUTTER }}
          >
            <span className="absolute -left-[5px] top-0 size-[11px] rounded-full bg-sun" />
          </div>
          {snapLine !== null && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 top-7 z-20 w-px bg-fg/60"
              style={{ left: GUTTER + snapLine * px }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
