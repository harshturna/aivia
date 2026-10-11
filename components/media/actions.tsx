"use client";

import {
  Download,
  Film,
  Frame,
  Heart,
  Maximize2,
  MessageSquarePlus,
  MoreHorizontal,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { createContext, useContext } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadFile, fileNameFrom } from "@/lib/download";
import type { MediaItem } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * One set of actions per kind of media (D-005 §17.3, TICKET-063), the same wherever a piece
 * appears. A surface says what it can do by providing handlers; an action without one does
 * not show. Order is fixed: the first actions of a kind are its primary ones.
 */
export type MediaHandlers = {
  open?: (item: MediaItem) => void;
  edit?: (item: MediaItem) => void;
  /** Paid: makes a clip from the still. */
  animate?: (item: MediaItem) => void;
  attachToBrief?: (item: MediaItem) => void;
  /** Grabs the frame a clip is showing; the surface finds the playing element. */
  frameToBrief?: (item: MediaItem, video?: HTMLVideoElement | null) => void;
  reusePrompt?: (item: MediaItem) => void;
  favourite?: (item: MediaItem) => void;
};

const Handlers = createContext<MediaHandlers>({});
export const MediaHandlersProvider = Handlers.Provider;
export const useMediaHandlers = () => useContext(Handlers);

/**
 * A project's saved pieces by address: a run's output is the same piece as its library asset,
 * so actions that need the asset (favourite) find it here.
 */
export type MediaIndex = Map<string, { id: string; favorite: boolean }>;
const Index = createContext<MediaIndex>(new Map());
export const MediaIndexProvider = Index.Provider;
export function useIndexed(item: MediaItem): MediaItem {
  const saved = useContext(Index).get(item.url);
  return saved
    ? { ...item, assetId: item.assetId ?? saved.id, favorite: saved.favorite }
    : item;
}

export type MediaAction = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primary: boolean;
  /** Paid actions say so. */
  cost?: string;
  run: (video?: HTMLVideoElement | null) => void;
};

export function actionsFor(item: MediaItem, h: MediaHandlers): MediaAction[] {
  const list: Array<MediaAction | false | "" | undefined> = [];
  const download: MediaAction = {
    id: "download",
    label: "Download",
    icon: Download,
    primary: false,
    run: () => downloadFile(item.url, fileNameFrom(item.prompt, item.kind)),
  };
  const reuse = !!h.reusePrompt &&
    !!item.prompt && {
      id: "reuse",
      label: "Reuse prompt",
      icon: RotateCcw,
      primary: false,
      run: () => h.reusePrompt?.(item),
    };
  const fav = !!h.favourite &&
    !!item.assetId && {
      id: "favourite",
      label: item.favorite ? "Remove from favourites" : "Add to favourites",
      icon: Heart,
      primary: false,
      run: () => h.favourite?.(item),
    };
  if (item.kind === "image") {
    list.push(
      h.open && {
        id: "open",
        label: "Open",
        icon: Maximize2,
        primary: true,
        run: () => h.open?.(item),
      },
      h.edit && {
        id: "edit",
        label: "Edit",
        icon: Wand2,
        primary: true,
        run: () => h.edit?.(item),
      },
      h.animate && {
        id: "animate",
        label: "Animate",
        icon: Film,
        primary: true,
        cost: "1 generation",
        run: () => h.animate?.(item),
      },
      h.attachToBrief && {
        id: "brief",
        label: "Use in a brief",
        icon: MessageSquarePlus,
        primary: false,
        run: () => h.attachToBrief?.(item),
      },
      reuse,
      download,
      fav
    );
  } else if (item.kind === "video") {
    list.push(
      h.open && {
        id: "open",
        label: "Open",
        icon: Maximize2,
        primary: true,
        run: () => h.open?.(item),
      },
      h.frameToBrief && {
        id: "frame",
        label: "Use a frame in a brief",
        icon: Frame,
        primary: true,
        run: (video) => h.frameToBrief?.(item, video),
      },
      { ...download, primary: true },
      reuse,
      fav
    );
  } else {
    list.push({ ...download, primary: true }, reuse, fav);
  }
  return list.filter(Boolean) as MediaAction[];
}

const ICON =
  "grid size-8 shrink-0 place-items-center rounded-control bg-bg/60 text-fg backdrop-blur transition-colors hover:bg-bg/80 [&_svg]:size-4";

/** The "⋯" menu: every action of a piece, primary first. */
export function MediaMenu({
  actions,
  label,
  className,
  video,
}: {
  actions: MediaAction[];
  label: string;
  className?: string;
  video?: () => HTMLVideoElement | null;
}) {
  if (!actions.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`More for ${label}`}
          title="More"
          className={cn(ICON, className)}
        >
          <MoreHorizontal />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onSelect={() => a.run(video?.())}
            className="gap-2.5 text-[13px] focus:bg-surface-3 focus:text-fg [&_svg]:size-4 [&_svg]:text-mute"
          >
            <a.icon />
            <span className="flex-1">{a.label}</span>
            {a.cost && (
              <span className="text-[11.5px] text-mute">{a.cost}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A picture's hover cluster, top right: its primary actions as icons, the rest under "⋯". On
 * a touch screen it shows when the piece is tapped (the surface passes `shown`).
 */
export function HoverActions({
  item,
  label,
  shown = false,
  video,
}: {
  item: MediaItem;
  label: string;
  shown?: boolean;
  video?: () => HTMLVideoElement | null;
}) {
  const actions = actionsFor(useIndexed(item), useMediaHandlers());
  if (!actions.length) return null;
  const primary = actions.filter((a) => a.primary);
  return (
    <div
      data-shown={shown}
      className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 data-[shown=true]:pointer-events-auto data-[shown=true]:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100"
    >
      {primary.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            a.run(video?.());
          }}
          aria-label={`${a.label}${a.cost ? ` (${a.cost})` : ""}: ${label}`}
          title={a.cost ? `${a.label}, ${a.cost}` : a.label}
          className={ICON}
        >
          <a.icon />
        </button>
      ))}
      <MediaMenu actions={actions} label={label} video={video} />
    </div>
  );
}

/** The same actions as buttons, for the lightbox's panel. */
export function ActionButtons({
  item,
  className,
}: {
  item: MediaItem;
  className?: string;
}) {
  const actions = actionsFor(useIndexed(item), useMediaHandlers()).filter(
    (a) => a.id !== "open"
  );
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => a.run()}
          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border px-3 text-[13px] text-fg transition-colors hover:bg-surface-3 [&_svg]:size-4"
        >
          <a.icon />
          {a.label}
          {a.cost && <span className="text-[11.5px] text-mute">{a.cost}</span>}
        </button>
      ))}
    </div>
  );
}
