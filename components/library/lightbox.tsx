"use client";

import {
  ArrowLeft,
  Download,
  Heart,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioRow } from "@/components/studio/audio-row";
import { titleFrom } from "@/components/studio/outputs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LibraryAsset } from "./types";

const KIND_LABEL: Record<LibraryAsset["kind"], string> = {
  image: "Image",
  video: "Video",
  music: "Music",
  sound: "Sound effect",
};

/**
 * The lightbox (design §6): the media centred on a dark scrim, a panel with what made it
 * and what you can do with it. As a modal it closes back to the library (Esc, the scrim,
 * the close button) and keeps focus inside; as a page it has a link back.
 */
export function Lightbox({
  asset,
  modal = false,
}: {
  asset: LibraryAsset;
  modal?: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(asset.favorite);
  const [confirming, setConfirming] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    if (modal) router.back();
    else router.push("/library");
  }, [modal, router]);

  // As a modal: remember what had focus, move focus in, keep it in, give it back on close.
  useEffect(() => {
    if (!modal) return;
    opener.current = document.activeElement;
    dialog.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = dialog.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video[controls], audio[controls], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [modal, close]);

  const toggleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);
    const response = await fetch(`/api/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });
    if (!response.ok) setFavorite(!next);
  };

  const remove = async () => {
    const response = await fetch(`/api/assets/${asset.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push("/library");
      router.refresh();
    }
  };

  // Formatted after mount: the server's time zone is not the viewer's.
  const [made, setMade] = useState("");
  useEffect(() => {
    setMade(
      new Date(asset.createdAt).toLocaleString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }, [asset.createdAt]);

  // A dialog only when it floats over the library; as a page it is the page.
  const dialogProps = modal
    ? {
        role: "dialog" as const,
        "aria-modal": true,
        "aria-label": `${KIND_LABEL[asset.kind]}: ${asset.prompt}`,
      }
    : {};

  const body = (
    <div
      ref={dialog}
      {...dialogProps}
      className={cn(
        "relative grid w-full min-h-0 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1",
        modal ? "h-full" : "min-h-dvh"
      )}
    >
      <div className="relative flex min-h-0 items-center justify-center p-4 lg:p-10">
        {asset.kind === "image" && (
          // biome-ignore lint/performance/noImgElement: generated media at its own size
          <img
            src={asset.url}
            alt={asset.prompt}
            className="max-h-full max-w-full rounded-media object-contain"
          />
        )}
        {asset.kind === "video" && (
          // biome-ignore lint/a11y/useMediaCaption: generated clips have no speech to caption
          <video
            src={asset.url}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="max-h-full max-w-full rounded-media"
          />
        )}
        {(asset.kind === "music" || asset.kind === "sound") && (
          <AudioRow
            className="w-full max-w-[560px]"
            src={asset.url}
            title={titleFrom(asset.prompt) || KIND_LABEL[asset.kind]}
            subtitle={KIND_LABEL[asset.kind]}
            seconds={asset.durationSec ?? undefined}
          />
        )}
      </div>

      <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-border bg-surface p-5 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between">
          {modal ? (
            <span className="text-[13px] font-medium text-fg-2">
              {KIND_LABEL[asset.kind]}
            </span>
          ) : (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-[13px] text-fg-2 hover:text-fg"
            >
              <ArrowLeft className="size-4" /> Library
            </Link>
          )}
          {modal && (
            <button
              type="button"
              onClick={close}
              data-autofocus
              aria-label="Close"
              className="grid size-8 place-items-center rounded-control text-mute transition-colors hover:bg-surface-3 hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div>
          <h2 className="text-[12px] text-mute">Prompt</h2>
          <p className="mt-1 text-[14px] leading-6 text-fg">{asset.prompt}</p>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          <dt className="text-mute">Made</dt>
          <dd className="text-fg-2">{made}</dd>
          {asset.width && asset.height && (
            <>
              <dt className="text-mute">Size</dt>
              <dd className="tabular text-fg-2">
                {asset.width} × {asset.height}
              </dd>
            </>
          )}
          {asset.durationSec && (
            <>
              <dt className="text-mute">Length</dt>
              <dd className="tabular text-fg-2">
                {Math.round(asset.durationSec)} s
              </dd>
            </>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <a
              href={asset.url}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download /> Download
            </a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFavorite}
            aria-pressed={favorite}
          >
            <Heart className={cn(favorite && "fill-current")} />
            {favorite ? "Favourite" : "Add to favourites"}
          </Button>
          {asset.sessionId && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/studio/${asset.sessionId}`}>
                <MessageSquare /> Open the session
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-auto border-t border-border pt-4">
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={remove}>
                Delete for good
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Keep it
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </aside>
    </div>
  );

  if (!modal) return body;

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in-0 duration-200">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-scrim backdrop-blur-sm"
      />
      <div className="absolute inset-3 overflow-hidden rounded-window border border-border bg-bg shadow-float lg:inset-8">
        {body}
      </div>
    </div>
  );
}
