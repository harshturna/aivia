"use client";

import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Music,
  Plus,
  Type,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatDuration } from "@/lib/duration";
import { addText, findItem, moveMain, remove } from "@/lib/timeline/ops";
import {
  endOf,
  type Item,
  type TimelineDoc,
  type Track,
} from "@/lib/timeline/schema";
import { cn } from "@/lib/utils";
import { Inspector, type TakeUI } from "./inspector";
import { clipRange, STILL_MS, setIn, setLength, setOut } from "./trim";

/**
 * Cut on a phone (D-005 §17.4, TICKET-066): a storyboard, not a timeline. The shots in order
 * (a handle to reorder, swipe left to remove, tap for a sheet that trims), the words, the score
 * and sounds. The same document, ops, history and autosave as the timeline.
 */
const SWIPE_REMOVE_PX = 96;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

type Change = (doc: TimelineDoc, commit: boolean, key?: string) => void;

export function Storyboard({
  doc,
  onChange,
  labelOf,
  time,
  onSeek,
  take,
}: {
  doc: TimelineDoc;
  onChange: Change;
  labelOf: (item: Item) => string;
  time: number;
  onSeek: (ms: number) => void;
  take?: TakeUI;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const main = doc.tracks.find(
    (t): t is Extract<Track, { kind: "main" }> => t.kind === "main"
  );
  const shots = main?.items ?? [];
  const words = doc.tracks.flatMap((t) =>
    t.kind === "text" ? t.items : []
  ) as Item[];
  const audio = doc.tracks.flatMap((t) =>
    t.kind === "audio" ? t.items.map((item) => ({ item, role: t.role })) : []
  );
  const hit = open ? findItem(doc, open) : null;

  return (
    <div className="grid gap-6 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Section title="Shots" count={shots.length}>
        <Shots
          doc={doc}
          shots={shots}
          labelOf={labelOf}
          onChange={onChange}
          onOpen={(id) => {
            const item = shots.find((s) => s.id === id);
            if (item) onSeek(item.start + Math.min(500, item.duration / 2));
            setOpen(id);
          }}
        />
        {!shots.length && (
          <p className="text-[13px] text-mute">
            No shots yet. Choose Add to cut on a piece in Make.
          </p>
        )}
      </Section>

      <Section title="Words" count={words.length}>
        <ul className="grid gap-1.5">
          {words.map((item) => (
            <li key={item.id}>
              <Row
                icon={<Type className="size-4 text-mute" />}
                label={labelOf(item)}
                meta={`${formatDuration(item.start / 1000)} for ${seconds(item.duration)}`}
                onOpen={() => {
                  onSeek(item.start + Math.min(500, item.duration / 2));
                  setOpen(item.id);
                }}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const r = addText(doc, time);
            onChange(r.doc, true);
            setOpen(r.id);
          }}
          className="flex h-9 items-center gap-2 justify-self-start rounded-control px-2 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Plus className="size-4" /> Add a text card at{" "}
          {formatDuration(time / 1000)}
        </button>
      </Section>

      {audio.length > 0 && (
        <Section title="Sound" count={audio.length}>
          <ul className="grid gap-1.5">
            {audio.map(({ item, role }) => (
              <li key={item.id}>
                <Row
                  icon={
                    role === "score" ? (
                      <Music className="size-4 text-mute" />
                    ) : (
                      <Volume2 className="size-4 text-mute" />
                    )
                  }
                  label={labelOf(item)}
                  meta={`${role === "score" ? "Score" : "Sound"}, ${seconds(item.duration)}`}
                  onOpen={() => setOpen(item.id)}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Sheet
        open={Boolean(hit)}
        onOpenChange={(next) => {
          if (!next) setOpen(null);
        }}
      >
        <SheetContent
          side="bottom"
          // the stage stays in view above the sheet: trimming shows its frame there
          overlayClassName="bg-transparent"
          className="max-h-[85dvh] overflow-y-auto rounded-t-panel border-border px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          {hit && (
            <ItemSheet
              doc={doc}
              item={hit.item}
              index={hit.index}
              isShot={hit.track.kind === "main"}
              shotCount={shots.length}
              title={labelOf(hit.item)}
              onChange={onChange}
              onSeek={onSeek}
              onClose={() => setOpen(null)}
              take={take}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2">
      <h2 className="flex items-baseline gap-2 text-[13px] font-medium">
        {title}
        <span className="tabular text-[12px] font-normal text-mute">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function Row({
  icon,
  label,
  meta,
  onOpen,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-12 w-full items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-2"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-chip bg-surface-2">
        {icon}
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-[13.5px]">{label}</span>
        <span className="tabular text-[12px] text-mute">{meta}</span>
      </span>
    </button>
  );
}

/** The shots: a handle drags one to a new place, a swipe left takes one out, a tap opens it. */
function Shots({
  doc,
  shots,
  labelOf,
  onChange,
  onOpen,
}: {
  doc: TimelineDoc;
  shots: Extract<Track, { kind: "main" }>["items"];
  labelOf: (item: Item) => string;
  onChange: Change;
  onOpen: (id: string) => void;
}) {
  const [drag, setDrag] = useState<{
    id: string;
    from: number;
    y0: number;
    dy: number;
    rowH: number;
  } | null>(null);
  const [swipe, setSwipe] = useState<{
    id: string;
    x0: number;
    y0: number;
    dx: number;
    on: boolean;
  } | null>(null);
  const swiped = useRef(false);

  const target = drag
    ? Math.max(
        0,
        Math.min(shots.length - 1, drag.from + Math.round(drag.dy / drag.rowH))
      )
    : -1;

  return (
    <ul className="grid select-none gap-1.5">
      {shots.map((item, index) => {
        const media = doc.media[item.media];
        const dragging = drag?.id === item.id;
        // the others make room for the one being dragged
        const shift =
          drag && !dragging
            ? index > drag.from && index <= target
              ? -drag.rowH
              : index < drag.from && index >= target
                ? drag.rowH
                : 0
            : 0;
        const dx =
          swipe?.id === item.id && swipe.on ? Math.min(0, swipe.dx) : 0;
        return (
          <li
            key={item.id}
            className={cn(
              "relative overflow-hidden rounded-control",
              dragging
                ? "z-10 shadow-float"
                : "transition-transform duration-150 ease-out motion-reduce:transition-none"
            )}
            style={{
              transform: `translateY(${dragging ? drag.dy : shift}px)`,
            }}
          >
            {/* what a swipe uncovers */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 flex items-center justify-end bg-surface-3 pr-4 text-[13px]",
                dx < -SWIPE_REMOVE_PX ? "text-fg" : "text-mute"
              )}
            >
              Remove
            </span>
            <div
              className={cn(
                "relative flex items-stretch rounded-control border border-border bg-surface",
                !swipe?.on &&
                  "transition-transform duration-150 ease-out motion-reduce:transition-none"
              )}
              style={{
                transform: `translateX(${dx}px)`,
              }}
            >
              {/* the handle: drag to reorder (Move earlier and later in the sheet do the same) */}
              <span
                aria-hidden
                className="grid w-9 shrink-0 cursor-grab touch-none place-items-center text-mute active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const row = event.currentTarget.closest("li");
                  setDrag({
                    id: item.id,
                    from: index,
                    y0: event.clientY,
                    dy: 0,
                    rowH: (row?.getBoundingClientRect().height ?? 56) + 6,
                  });
                }}
                onPointerMove={(event) => {
                  if (drag?.id === item.id)
                    setDrag({ ...drag, dy: event.clientY - drag.y0 });
                }}
                onPointerUp={() => {
                  if (drag?.id !== item.id) return;
                  if (target !== drag.from)
                    onChange(moveMain(doc, item.id, target), true);
                  setDrag(null);
                }}
                onPointerCancel={() => setDrag(null)}
              >
                <GripVertical className="size-4" />
              </span>
              <button
                type="button"
                className="flex min-h-14 min-w-0 flex-1 touch-pan-y items-center gap-3 py-2 pr-3 text-left"
                onPointerDown={(event) => {
                  swiped.current = false;
                  setSwipe({
                    id: item.id,
                    x0: event.clientX,
                    y0: event.clientY,
                    dx: 0,
                    on: false,
                  });
                }}
                onPointerMove={(event) => {
                  if (swipe?.id !== item.id) return;
                  const dx = event.clientX - swipe.x0;
                  const dy = event.clientY - swipe.y0;
                  if (
                    !swipe.on &&
                    Math.abs(dx) > 10 &&
                    Math.abs(dx) > Math.abs(dy)
                  ) {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setSwipe({ ...swipe, dx, on: true });
                  } else if (swipe.on) setSwipe({ ...swipe, dx });
                }}
                onPointerUp={() => {
                  if (swipe?.id !== item.id) return;
                  if (swipe.on) {
                    swiped.current = true;
                    if (swipe.dx < -SWIPE_REMOVE_PX)
                      onChange(remove(doc, item.id), true);
                  }
                  setSwipe(null);
                }}
                onPointerCancel={() => setSwipe(null)}
                onClick={() => {
                  if (swiped.current) {
                    swiped.current = false;
                    return;
                  }
                  onOpen(item.id);
                }}
              >
                <Thumb
                  url={media?.url}
                  kind={item.type}
                  at={item.type === "video" ? item.in : 0}
                />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-[13.5px]">
                    {labelOf(item)}
                  </span>
                  <span className="tabular flex gap-2 text-[12px] text-mute">
                    <span>{seconds(item.duration)}</span>
                    {index > 0 && item.transitionIn && (
                      <span>Crossfades in</span>
                    )}
                  </span>
                </span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Thumb({
  url,
  kind,
  at,
}: {
  url?: string;
  kind: "video" | "image";
  at: number;
}) {
  const box = "h-10 w-[72px] shrink-0 rounded-chip bg-surface-2 object-cover";
  if (!url) return <span className={box} />;
  return kind === "video" ? (
    <video
      src={`${url}#t=${(at + 200) / 1000}`}
      preload="metadata"
      muted
      playsInline
      aria-hidden
      tabIndex={-1}
      className={box}
    />
  ) : (
    // biome-ignore lint/performance/noImgElement: a thumbnail of the user's own media URL
    <img
      src={url}
      alt=""
      width={72}
      height={40}
      loading="lazy"
      className={box}
    />
  );
}

/** Tap a shot: its trim, its place, then the same settings as the desktop inspector. */
function ItemSheet({
  doc,
  item,
  index,
  isShot,
  shotCount,
  title,
  onChange,
  onSeek,
  onClose,
  take,
}: {
  doc: TimelineDoc;
  item: Item;
  index: number;
  isShot: boolean;
  shotCount: number;
  title: string;
  onChange: Change;
  onSeek: (ms: number) => void;
  onClose: () => void;
  take?: TakeUI;
}) {
  const range = item.type === "video" ? clipRange(doc, item.id) : null;
  return (
    <div className="mx-auto grid max-w-[560px] gap-4">
      <div className="grid gap-0.5 pr-10">
        <SheetTitle className="truncate text-[15px]">{title}</SheetTitle>
        <p className="tabular text-[12px] text-mute">
          {formatDuration(item.start / 1000)} to{" "}
          {formatDuration(endOf(item) / 1000)}, {seconds(item.duration)}
        </p>
      </div>

      {range && (
        <TrimBar
          source={range.source}
          from={range.from}
          to={range.to}
          onIn={(ms, commit) => {
            const next = setIn(doc, item.id, ms);
            onChange(next, commit);
            const moved = findItem(next, item.id)?.item;
            // a little in, past its fade, where the new first frame is fully on screen
            if (moved?.type === "video")
              onSeek(
                moved.start +
                  Math.min(
                    moved.duration / 2,
                    Math.max(
                      moved.fadeIn ?? 0,
                      moved.transitionIn?.duration ?? 0
                    )
                  ) +
                  1000 / doc.fps
              );
          }}
          onOut={(ms, commit) => {
            const next = setOut(doc, item.id, ms);
            onChange(next, commit);
            const moved = findItem(next, item.id)?.item;
            if (moved) onSeek(endOf(moved) - 1000 / doc.fps);
          }}
        />
      )}

      {item.type === "image" && (
        <label className="grid gap-1 text-[13px]">
          <span className="flex justify-between text-fg-2">
            Length
            <span className="tabular text-mute">{seconds(item.duration)}</span>
          </span>
          <input
            type="range"
            name="still-length"
            min={STILL_MS.min}
            max={STILL_MS.max}
            step={100}
            value={item.duration}
            onChange={(e) =>
              onChange(setLength(doc, item.id, Number(e.target.value)), false)
            }
            onPointerUp={() => onChange(doc, true)}
            onKeyUp={() => onChange(doc, true)}
            className="w-full accent-primary"
          />
        </label>
      )}

      {isShot && shotCount > 1 && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onChange(moveMain(doc, item.id, index - 1), true)}
            className="flex h-9 items-center gap-1.5 rounded-control border border-border px-3 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            <ArrowUp className="size-4" /> Move earlier
          </button>
          <button
            type="button"
            disabled={index >= shotCount - 1}
            onClick={() => onChange(moveMain(doc, item.id, index + 1), true)}
            className="flex h-9 items-center gap-1.5 rounded-control border border-border px-3 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            <ArrowDown className="size-4" /> Move later
          </button>
        </div>
      )}

      <Inspector
        doc={doc}
        selected={item.id}
        onChange={onChange}
        onDeselect={onClose}
        heading={false}
        take={take}
      />
    </div>
  );
}

/**
 * A clip over its whole source: the kept part between two handles. Drag a handle, or focus it
 * and use the arrow keys (a tenth of a second; with Shift, a second).
 */
function TrimBar({
  source,
  from,
  to,
  onIn,
  onOut,
}: {
  source: number;
  from: number;
  to: number;
  onIn: (ms: number, commit: boolean) => void;
  onOut: (ms: number, commit: boolean) => void;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const last = useRef<{ edge: "in" | "out"; ms: number } | null>(null);
  const at = (clientX: number) => {
    const r = bar.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.round(
      Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * source
    );
  };
  const pct = (ms: number) => `${(ms / source) * 100}%`;
  const handle = (edge: "in" | "out") => {
    const value = edge === "in" ? from : to;
    const set = edge === "in" ? onIn : onOut;
    return (
      <span
        role="slider"
        tabIndex={0}
        aria-label={edge === "in" ? "Start of the clip" : "End of the clip"}
        aria-valuemin={0}
        aria-valuemax={source}
        aria-valuenow={value}
        aria-valuetext={seconds(value)}
        className="absolute top-1/2 z-10 grid h-11 w-6 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center"
        style={{ left: pct(value) }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          last.current = { edge, ms: value };
        }}
        onPointerMove={(event) => {
          if (last.current?.edge !== edge) return;
          last.current.ms = at(event.clientX);
          set(last.current.ms, false);
        }}
        onPointerUp={() => {
          if (last.current?.edge === edge) set(last.current.ms, true);
          last.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const step =
            (event.shiftKey ? 1000 : 100) *
            (event.key === "ArrowLeft" ? -1 : 1);
          set(value + step, true);
        }}
      >
        <span className="h-8 w-1.5 rounded-full bg-fg" />
      </span>
    );
  };
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-[13px] text-fg-2">
        Trim
        <span className="tabular text-mute">
          {seconds(from)} to {seconds(to)} of {seconds(source)}
        </span>
      </div>
      <div ref={bar} className="relative mx-3 h-11">
        <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-chip bg-surface-3" />
        <div
          className="absolute top-1/2 h-8 -translate-y-1/2 rounded-chip border-2 border-fg bg-surface-2"
          style={{ left: pct(from), width: pct(to - from) }}
        />
        {handle("in")}
        {handle("out")}
      </div>
    </div>
  );
}
