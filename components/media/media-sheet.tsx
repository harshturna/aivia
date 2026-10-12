"use client";

import { ArrowLeft, Music } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { MediaItem } from "@/lib/media";
import { ActionButtons } from "./actions";
import { MediaTray } from "./tray";

/**
 * A project's media on a phone (D-005 §17.4, TICKET-076): the tray as a two-column grid in a
 * sheet from the foot. A tap opens the piece there with everything it can do (§17.3's action
 * sheet), and, in Make, a way to see it where it was made.
 */
export function MediaSheet({
  open,
  onOpenChange,
  groups,
  libraryHref,
  onShow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Array<{ id: string; brief: string; items: MediaItem[] }>;
  libraryHref?: string | null;
  /** Make: scroll the thread to the piece. */
  onShow?: (item: MediaItem) => void;
}) {
  const [piece, setPiece] = useState<MediaItem | null>(null);
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setPiece(null);
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="bottom"
        className="flex h-[85dvh] flex-col rounded-t-panel border-border p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <SheetTitle className="sr-only">Media</SheetTitle>
        {piece ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-3 pb-4">
            <button
              type="button"
              onClick={() => setPiece(null)}
              className="flex min-h-11 items-center gap-2 self-start rounded-control pr-3 text-[13px] text-fg-2"
            >
              <ArrowLeft className="size-4" /> All media
            </button>
            {piece.kind === "image" ? (
              // biome-ignore lint/performance/noImgElement: generated media at its own size
              <img
                src={piece.url}
                alt={piece.prompt}
                className="max-h-[40dvh] w-full rounded-media bg-surface object-contain"
              />
            ) : piece.kind === "video" ? (
              <video
                src={piece.url}
                controls
                playsInline
                preload="metadata"
                className="max-h-[40dvh] w-full rounded-media bg-surface"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-media bg-surface px-3 py-4 text-[13px] text-fg-2">
                <Music className="size-4 text-mute" />
                <audio src={piece.url} controls className="w-full" />
              </div>
            )}
            {piece.prompt && (
              <p className="text-[13px] leading-5 text-fg-2">{piece.prompt}</p>
            )}
            <ActionButtons item={piece} />
            {onShow && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setPiece(null);
                  onShow(piece);
                }}
                className="min-h-11 self-start rounded-control px-1 text-[13px] text-fg-2 underline underline-offset-2"
              >
                Show where it was made
              </button>
            )}
          </div>
        ) : (
          <MediaTray
            groups={groups}
            onOpen={setPiece}
            libraryHref={libraryHref}
            columns={2}
            hint="Tap a piece for everything it can do."
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
