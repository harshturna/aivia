"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  Heart,
  MessageSquare,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioRow } from "@/components/studio/audio-row";
import { titleFrom } from "@/components/studio/outputs";
import { Button } from "@/components/ui/button";
import { downloadFile, fileNameFrom } from "@/lib/download";
import { formatDuration } from "@/lib/duration";
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
type View = { asset: LibraryAsset; prev: string | null; next: string | null };

export function Lightbox({
  asset: initialAsset,
  modal = false,
  readOnly = false,
  prev: initialPrev = null,
  next: initialNext = null,
}: {
  asset: LibraryAsset;
  modal?: boolean;
  /** The newer and older assets, for previous and next (TICKET-053). */
  prev?: string | null;
  next?: string | null;
  /** The shared guest account: a curated example it can view but not change or delete. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  // the item shown, swapped in place by previous and next: no route change, so no loading
  // state and no fresh dialog fading in on every step (TICKET-057)
  const [view, setView] = useState<View>({
    asset: initialAsset,
    prev: initialPrev,
    next: initialNext,
  });
  const { asset, prev, next } = view;
  const known = useRef(new Map<string, View>());
  const [favorite, setFavorite] = useState(asset.favorite);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  // what belongs to one item starts over on the next
  useEffect(() => {
    setFavorite(asset.favorite);
    setConfirming(false);
    setFailed(false);
  }, [asset]);

  const load = useCallback(async (id: string) => {
    const cached = known.current.get(id);
    if (cached) return cached;
    const response = await fetch(`/api/assets/${id}`).catch(() => null);
    if (!response?.ok) return null;
    const loaded = (await response.json()) as View;
    known.current.set(id, loaded);
    return loaded;
  }, []);

  // the neighbours are fetched, and their pictures loaded, before anyone asks for them
  // (two deep each way, so stepping quickly never waits)
  useEffect(() => {
    const ahead = async (
      id: string | null,
      way: "prev" | "next",
      depth: number
    ) => {
      if (!id || depth === 0) return;
      const v = await load(id);
      if (!v) return;
      if (v.asset.kind === "image") new Image().src = v.asset.url;
      await ahead(v[way], way, depth - 1);
    };
    void ahead(prev, "prev", 2);
    void ahead(next, "next", 2);
  }, [prev, next, load]);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    if (modal) router.back();
    else router.push("/library");
  }, [modal, router]);
  const go = useCallback(
    async (id: string | null) => {
      if (!id) return;
      const v = await load(id);
      if (!v) return;
      setView(v);
      // the address follows, so a reload or a shared link opens this item
      window.history.replaceState(null, "", `/library/a/${id}`);
    },
    [load]
  );

  // ← and → step through the library; Esc leaves the page view (the modal handles its own)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const t = event.target as HTMLElement;
      if (t.closest("input, textarea, video, audio, [contenteditable=true]"))
        return;
      if (event.key === "ArrowLeft") void go(prev);
      if (event.key === "ArrowRight") void go(next);
      if (event.key === "Escape" && !modal) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, prev, next, modal, close]);

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
    // replaced, not pushed: Back must not land on the asset that is gone
    if (response.ok) {
      router.replace("/library");
      router.refresh();
    } else setFailed(true);
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

  const audio = asset.kind === "music" || asset.kind === "sound";

  const body = (
    <div
      ref={dialog}
      {...dialogProps}
      className={cn(
        // one explicit column on phones, so long text cannot widen it past the screen
        "relative grid w-full min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1",
        modal ? "h-full" : "h-dvh"
      )}
    >
      <div className="relative flex min-h-0 items-center justify-center p-4 lg:p-10">
        {prev && (
          <button
            type="button"
            onClick={() => void go(prev)}
            aria-label="Previous"
            title="Previous (←)"
            className={cn(
              "absolute left-2 z-10 grid size-9 place-items-center rounded-full bg-bg/60 text-fg backdrop-blur transition-colors hover:bg-bg/80",
              // over a sound row they would cover its play button: below it instead
              audio ? "bottom-3" : "top-1/2 -translate-y-1/2"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {next && (
          <button
            type="button"
            onClick={() => void go(next)}
            aria-label="Next"
            title="Next (→)"
            className={cn(
              "absolute right-2 z-10 grid size-9 place-items-center rounded-full bg-bg/60 text-fg backdrop-blur transition-colors hover:bg-bg/80",
              // over a sound row they would cover its play button: below it instead
              audio ? "bottom-3" : "top-1/2 -translate-y-1/2"
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        )}
        {asset.kind === "image" && (
          // biome-ignore lint/performance/noImgElement: generated media at its own size
          <img
            key={asset.id}
            src={asset.url}
            alt={asset.prompt}
            className="max-h-full max-w-full rounded-media object-contain"
          />
        )}
        {asset.kind === "video" && (
          // biome-ignore lint/a11y/useMediaCaption: generated clips have no speech to caption
          <video
            key={asset.id}
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
            key={asset.id}
            className="w-full max-w-[560px]"
            src={asset.url}
            title={titleFrom(asset.prompt) || KIND_LABEL[asset.kind]}
            subtitle={KIND_LABEL[asset.kind]}
            seconds={asset.durationSec ?? undefined}
            downloadable={false}
          />
        )}
      </div>

      <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-border bg-surface p-5 max-lg:max-h-[55dvh] lg:border-l lg:border-t-0">
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
                {formatDuration(asset.durationSec)}
              </dd>
            </>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadFile(asset.url, fileNameFrom(asset.prompt, asset.kind))
            }
          >
            <Download /> Download
          </Button>
          {!readOnly && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFavorite}
              aria-pressed={favorite}
            >
              <Heart className={cn(favorite && "fill-current")} />
              {favorite ? "In favourites" : "Add to favourites"}
            </Button>
          )}
          {asset.kind === "image" && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/studio?animate=${asset.id}`}>
                <Film /> Animate
              </Link>
            </Button>
          )}
          {asset.kind === "image" && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/edit?asset=${asset.id}`}>
                <Wand2 /> Edit
              </Link>
            </Button>
          )}
          {asset.sessionId && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/studio/${asset.sessionId}`}>
                <MessageSquare /> Open the session
              </Link>
            </Button>
          )}
        </div>

        {!readOnly && (
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
                {failed && (
                  <span role="alert" className="text-[13px] text-fg-2">
                    It was not deleted. Try again.
                  </span>
                )}
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
        )}
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
