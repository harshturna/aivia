"use client";

import { Check, Music, PanelRightClose, Play } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { downloadFile, fileNameFrom } from "@/lib/download";
import type { MediaItem, MediaKind } from "@/lib/media";
import { cn } from "@/lib/utils";
import { actionsFor, MediaMenu, useIndexed, useMediaHandlers } from "./actions";

/**
 * A project's media tray (D-005 §17.2, TICKET-063): everything the project made, grouped by
 * the brief that made it, newest first. A piece opens (the thread scrolls to it), carries the
 * same actions as everywhere else, drags into the composer as a reference, and can be
 * selected with ⌘ or ⇧ to download several at once.
 */
export const MEDIA_DRAG = "application/x-aivia-media";

type Group = { id: string; brief: string; items: MediaItem[] };
type Filter = "all" | "image" | "video" | "audio";

const FILTERS: Array<[Filter, string]> = [
  ["all", "All"],
  ["image", "Images"],
  ["video", "Video"],
  ["audio", "Audio"],
];

const matches = (kind: MediaKind, f: Filter) =>
  f === "all" ||
  (f === "audio" ? kind === "music" || kind === "sound" : kind === f);

function Piece({
  item: base,
  selected,
  onActivate,
}: {
  item: MediaItem;
  selected: boolean;
  onActivate: (item: MediaItem, toggle: boolean) => void;
}) {
  const item = useIndexed(base);
  const actions = actionsFor(item, useMediaHandlers());
  const audio = item.kind === "music" || item.kind === "sound";
  // dragging is a mouse's gesture: on touch a long press would start the system's drag
  const fine = useFinePointer();
  return (
    <li
      className={cn("group relative", audio && "col-span-full")}
      draggable={fine}
      onDragStart={(event) => {
        event.dataTransfer.setData(MEDIA_DRAG, JSON.stringify(item));
        event.dataTransfer.effectAllowed = "copy";
      }}
    >
      <button
        type="button"
        onClick={(event) =>
          onActivate(item, event.metaKey || event.ctrlKey || event.shiftKey)
        }
        aria-pressed={selected}
        aria-label={item.prompt || item.kind}
        className={cn(
          "relative block w-full overflow-hidden rounded-control bg-surface-2 text-left outline-offset-2",
          audio ? "h-10" : "aspect-square",
          selected && "ring-2 ring-fg"
        )}
      >
        {item.kind === "image" && (
          // biome-ignore lint/performance/noImgElement: generated media at its own size
          <img
            src={item.url}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}
        {item.kind === "video" && (
          <>
            <video
              src={`${item.url}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              aria-hidden
              className="size-full object-cover"
            />
            <Play className="absolute bottom-1.5 left-1.5 size-3.5 fill-current text-fg drop-shadow" />
          </>
        )}
        {audio && (
          <span className="flex h-full items-center gap-2 px-2.5 text-[12.5px] text-fg-2">
            <Music className="size-3.5 shrink-0 text-mute" />
            <span className="truncate">{item.prompt || "Track"}</span>
          </span>
        )}
        {selected && (
          <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-fg text-bg">
            <Check className="size-3" />
          </span>
        )}
      </button>
      <div className="pointer-events-none absolute right-1 top-1 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
        <MediaMenu
          actions={actions}
          label={item.prompt || item.kind}
          className="size-7"
        />
      </div>
    </li>
  );
}

export function MediaTray({
  groups,
  onOpen,
  onClose,
  libraryHref,
  footer,
  hint = "Drag a piece into the brief to use it. ⌘-click to select.",
  columns = 3,
}: {
  groups: Group[];
  /** Show the piece where it was made. */
  onOpen: (item: MediaItem) => void;
  onClose?: () => void;
  /** The project's media in the library, when it is saved there. */
  libraryHref?: string | null;
  /** What sits above the tray's foot (the Cut view's selected item, TICKET-065). */
  footer?: React.ReactNode;
  /** What the tray's foot says a piece can be dragged into. */
  hint?: string;
  /** Three in the side tray, two in a phone's sheet (§17.4). */
  columns?: 2 | 3;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const shown = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => matches(i.kind, filter)),
    }))
    .filter((g) => g.items.length);

  const activate = (item: MediaItem, toggle: boolean) => {
    if (toggle || selected.size) {
      setSelected((s) => {
        const next = new Set(s);
        if (next.has(item.url)) next.delete(item.url);
        else next.add(item.url);
        return next;
      });
    } else onOpen(item);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-13 shrink-0 items-center gap-2 px-4">
        <h2 className="text-[15px] font-medium">Media</h2>
        <span className="tabular text-[12.5px] text-mute">{all.length}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide the media"
            title="Hide the media (⌘.)"
            className="ml-auto grid size-8 place-items-center rounded-control text-mute transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <PanelRightClose className="size-4" />
          </button>
        )}
      </div>
      <div className="flex shrink-0 gap-1 px-4 pb-3">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn(
              "h-7 pointer-coarse:h-11 rounded-full px-2.5 text-[12.5px] font-medium transition-colors",
              filter === id ? "bg-surface-3 text-fg" : "text-fg-2 hover:text-fg"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        {shown.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-mute">
            {all.length
              ? "Nothing of that kind yet."
              : "Nothing here yet. What you make lands here."}
          </p>
        ) : (
          shown.map((g) => (
            <section key={g.id} className="mb-5">
              <h3
                className="mb-2 truncate text-[12px] text-mute"
                title={g.brief}
              >
                {g.brief || "A brief"}
              </h3>
              <ul
                className={cn(
                  "grid gap-1.5",
                  columns === 2 ? "grid-cols-2" : "grid-cols-3"
                )}
              >
                {g.items.map((item) => (
                  <Piece
                    key={item.url}
                    item={item}
                    selected={selected.has(item.url)}
                    onActivate={activate}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
      {footer && (
        <div className="max-h-[45%] shrink-0 overflow-y-auto border-t border-border px-4 py-3">
          {footer}
        </div>
      )}
      <div className="shrink-0 border-t border-border px-4 py-3">
        {selected.size > 0 ? (
          <div className="flex items-center gap-2 text-[13px]">
            <span className="tabular text-fg-2">{selected.size} selected</span>
            <button
              type="button"
              onClick={() => {
                for (const item of all.filter((i) => selected.has(i.url)))
                  void downloadFile(
                    item.url,
                    fileNameFrom(item.prompt, item.kind)
                  );
              }}
              className="ml-auto rounded-control px-2 py-1 text-fg transition-colors hover:bg-surface-2"
            >
              Download
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-control px-2 py-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Clear
            </button>
          </div>
        ) : (
          <p className="text-[12px] leading-4 text-mute">
            {hint}
            {libraryHref && (
              <>
                {" "}
                <Link
                  href={libraryHref}
                  className="text-fg-2 underline underline-offset-2 hover:text-fg"
                >
                  In the library
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
