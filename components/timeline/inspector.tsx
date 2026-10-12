"use client";

import { formatDuration } from "@/lib/duration";
import { findItem, remove, setCrossfade, update } from "@/lib/timeline/ops";
import { endOf, type TimelineDoc } from "@/lib/timeline/schema";
import { cn } from "@/lib/utils";

/**
 * The selected item's few settings (D-005 §17.2, TICKET-065), at the foot of the tray: a card's
 * words and style, a picture's crossfade and push, a sound's level and fades.
 */
export function Inspector({
  doc,
  selected,
  onChange,
  onDeselect,
}: {
  doc: TimelineDoc;
  selected: string | null;
  onChange: (doc: TimelineDoc, commit: boolean) => void;
  onDeselect: () => void;
}) {
  const hit = selected ? findItem(doc, selected) : null;
  if (!hit)
    return (
      <p className="text-[12px] leading-4 text-mute">
        Select something on the timeline to change it.
      </p>
    );
  const { item, track, index } = hit;
  const set = (next: TimelineDoc) => onChange(next, true);
  const span = `${formatDuration(item.start / 1000)} to ${formatDuration(endOf(item) / 1000)}`;
  const row = "flex items-center justify-between gap-3 text-[13px]";
  const toggle = (on: boolean, label: string, run: (v: boolean) => void) => (
    <label className={row}>
      <span className="text-fg-2">{label}</span>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => run(e.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
  const slider = (
    label: string,
    value: number,
    max: number,
    run: (v: number) => void,
    fmt: (v: number) => string
  ) => (
    <label className="grid gap-1 text-[13px]">
      <span className="flex justify-between text-fg-2">
        {label}
        <span className="tabular text-mute">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={max > 10 ? 100 : 0.05}
        value={value}
        onChange={(e) =>
          onChange(run(Number(e.target.value)) as unknown as TimelineDoc, false)
        }
        onPointerUp={() => onChange(doc, true)}
        onKeyUp={() => onChange(doc, true)}
        className="w-full accent-primary"
      />
    </label>
  );
  const name =
    item.type === "text"
      ? "Text card"
      : item.type === "video"
        ? "Clip"
        : item.type === "image"
          ? "Still"
          : track.kind === "audio" && track.role === "score"
            ? "Score"
            : "Sound";

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium">{name}</h3>
        <span className="tabular text-[12px] text-mute">{span}</span>
      </div>

      {item.type === "text" && (
        <>
          <textarea
            value={item.text}
            onChange={(e) =>
              onChange(update(doc, item.id, { text: e.target.value }), false)
            }
            onBlur={() => onChange(doc, true)}
            rows={2}
            name="card-words"
            autoComplete="off"
            aria-label="The card's words"
            className="w-full resize-none rounded-control border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg"
          />
          <div className="flex gap-1">
            {(["title", "caption"] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={item.style.preset === p}
                onClick={() => set(update(doc, item.id, { preset: p }))}
                className={cn(
                  "h-7 rounded-full px-2.5 text-[12.5px] font-medium",
                  item.style.preset === p
                    ? "bg-surface-3 text-fg"
                    : "text-fg-2 hover:text-fg"
                )}
              >
                {p === "title" ? "Title" : "Caption"}
              </button>
            ))}
          </div>
        </>
      )}

      {(item.type === "video" || item.type === "image") &&
        index > 0 &&
        toggle(Boolean(item.transitionIn), "Crossfade in", (v) =>
          set(setCrossfade(doc, item.id, v))
        )}

      {item.type === "image" && (
        <>
          {toggle(Boolean(item.motion), "Slow push in", (v) =>
            set(update(doc, item.id, { push: v }))
          )}
          <input
            value={item.text ?? ""}
            onChange={(e) =>
              onChange(update(doc, item.id, { text: e.target.value }), false)
            }
            onBlur={() => onChange(doc, true)}
            name="still-words"
            autoComplete="off"
            placeholder="Words over the picture…"
            aria-label="Words over the picture"
            className="h-8 w-full rounded-control border border-border bg-surface px-2.5 text-[13px] text-fg placeholder:text-mute"
          />
        </>
      )}

      {item.type === "audio" && (
        <>
          {slider(
            "Level",
            item.volume,
            1,
            (v) => update(doc, item.id, { volume: v }),
            (v) => `${Math.round(v * 100)}%`
          )}
          {slider(
            "Fade in",
            item.fadeIn ?? 0,
            Math.min(5000, item.duration),
            (v) => update(doc, item.id, { fadeIn: v }),
            (v) => `${(v / 1000).toFixed(1)} s`
          )}
          {slider(
            "Fade out",
            item.fadeOut ?? 0,
            Math.min(5000, item.duration),
            (v) => update(doc, item.id, { fadeOut: v }),
            (v) => `${(v / 1000).toFixed(1)} s`
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => {
          set(remove(doc, item.id));
          onDeselect();
        }}
        className="justify-self-start rounded-control px-2 py-1 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
      >
        Remove from the cut
      </button>
    </div>
  );
}
