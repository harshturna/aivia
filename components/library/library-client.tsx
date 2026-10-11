"use client";

import { Check, Heart, Maximize2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  actionsFor,
  HoverActions,
  MediaHandlersProvider,
  MediaMenu,
} from "@/components/media/actions";
import { useLibraryHandlers } from "@/components/media/library-handlers";
import { ScreenHeader } from "@/components/shell/screen";
import { AudioRow } from "@/components/studio/audio-row";
import { titleFrom } from "@/components/studio/outputs";
import { RevealImage } from "@/components/studio/reveal-image";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { groupByDay } from "@/lib/day-groups";
import { downloadFile, fileNameFrom } from "@/lib/download";
import { formatDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import type { LibraryAsset, LibraryKind } from "./types";

/** Each kind carries its medium's tint from the landing (D-004): bark, water, light. */
const TABS: Array<{ id: LibraryKind; label: string; tint?: string }> = [
  { id: "all", label: "All" },
  { id: "image", label: "Images", tint: "bg-tint-bark" },
  { id: "video", label: "Video", tint: "bg-tint-water" },
  { id: "audio", label: "Audio", tint: "bg-tint-light" },
];

/**
 * The library (design §6): the filters live in the URL, the body groups by day, images and
 * clips in masonry, audio as rows, more loaded as the end comes into view.
 */
export function LibraryClient({
  initialItems,
  initialCursor,
  kind,
  query,
  favorites,
  project = null,
  readOnly = false,
}: {
  initialItems: LibraryAsset[];
  initialCursor: string | null;
  kind: LibraryKind;
  query: string;
  favorites: boolean;
  /** Showing one project's media (TICKET-062). */
  project?: { id: string; title: string } | null;
  /** The shared guest account sees the curated examples and cannot change them. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query);
  const [searching, startSearch] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  // a new search's results arrive as new props; they replace the list in place
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
  }, [initialItems, initialCursor]);

  const href = useCallback(
    (next: {
      kind?: LibraryKind;
      q?: string;
      fav?: boolean;
      project?: string | null;
    }) => {
      const p = new URLSearchParams();
      const k = next.kind ?? kind;
      const q = next.q ?? query;
      const f = next.fav ?? favorites;
      const pr = next.project === undefined ? project?.id : next.project;
      if (k !== "all") p.set("kind", k);
      if (q) p.set("q", q);
      if (f) p.set("fav", "1");
      if (pr) p.set("project", pr);
      const s = p.toString();
      return `/library${s ? `?${s}` : ""}`;
    },
    [kind, query, favorites, project]
  );

  // Search as you type, after a pause.
  useEffect(() => {
    if (search === query) return;
    const id = setTimeout(
      () =>
        startSearch(() =>
          router.replace(href({ q: search.trim() }), { scroll: false })
        ),
      350
    );
    return () => clearTimeout(id);
  }, [search, query, router, href]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ cursor });
      if (kind !== "all") p.set("kind", kind);
      if (query) p.set("q", query);
      if (favorites) p.set("fav", "1");
      if (project) p.set("project", project.id);
      const response = await fetch(`/api/assets?${p}`);
      if (response.ok) {
        const page = (await response.json()) as {
          items: LibraryAsset[];
          nextCursor: string | null;
        };
        setItems((current) => [...current, ...page.items]);
        setCursor(page.nextCursor);
      }
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, kind, query, favorites, project]);

  useEffect(() => {
    const el = end.current;
    if (!el || !cursor) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loadMore]);

  // Grouped in UTC for the first render (the server's and the browser's first pass agree),
  // then in the viewer's own time zone once mounted.
  const [timeZone, setTimeZone] = useState<string | undefined>("UTC");
  useEffect(() => setTimeZone(undefined), []);
  const groups = useMemo(
    () =>
      groupByDay(
        items.map((a) => ({ ...a, createdAt: new Date(a.createdAt) })),
        new Date(),
        timeZone
      ),
    [items, timeZone]
  );

  const toggleFavorite = async (asset: LibraryAsset) => {
    const next = !asset.favorite;
    setItems((current) =>
      current.map((a) => (a.id === asset.id ? { ...a, favorite: next } : a))
    );
    const response = await fetch(`/api/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });
    if (!response.ok)
      setItems((current) =>
        current.map((a) => (a.id === asset.id ? { ...a, favorite: !next } : a))
      );
  };

  // ── several at once (TICKET-063): ⌘ or ⇧ on a tile selects it ───────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const select = useCallback(
    (asset: LibraryAsset, toggle: boolean) => {
      if (!toggle && selected.size === 0) return false;
      setSelected((s) => {
        const next = new Set(s);
        if (next.has(asset.id)) next.delete(asset.id);
        else next.add(asset.id);
        return next;
      });
      setConfirmDelete(false);
      return true;
    },
    [selected.size]
  );
  const chosen = items.filter((a) => selected.has(a.id));
  const deleteChosen = async () => {
    const results = await Promise.all(
      chosen.map((a) =>
        fetch(`/api/assets/${a.id}`, { method: "DELETE" }).then((r) => r.ok)
      )
    );
    const gone = new Set(chosen.filter((_, i) => results[i]).map((a) => a.id));
    setItems((current) => current.filter((a) => !gone.has(a.id)));
    setSelected(new Set());
    setConfirmDelete(false);
    router.refresh();
  };

  const handlers = useLibraryHandlers({
    favourite: readOnly
      ? undefined
      : (item) => {
          const asset = items.find((a) => a.id === item.assetId);
          if (asset) void toggleFavorite(asset);
        },
    open: (item) =>
      router.push(`/library/a/${item.assetId}`, { scroll: false }),
  });

  const filtered = Boolean(query) || favorites || kind !== "all" || !!project;

  return (
    <MediaHandlersProvider value={handlers}>
      <div className="min-h-dvh">
        <ScreenHeader title="Library">
          <div className="hidden items-center gap-2 md:flex">
            <SearchField value={search} onChange={setSearch} />
            {!readOnly && (
              <FavouritesToggle
                on={favorites}
                href={href({ fav: !favorites })}
              />
            )}
          </div>
        </ScreenHeader>

        <div className="px-3 pt-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <nav
              aria-label="Kind"
              className="inline-flex rounded-control border border-border p-0.5 text-[13px] font-medium"
            >
              {TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={href({ kind: tab.id })}
                  aria-current={tab.id === kind ? "page" : undefined}
                  replace
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-chip px-3 py-1 transition-colors duration-150",
                    tab.id === kind
                      ? "bg-surface-3 text-fg"
                      : "text-fg-2 hover:text-fg"
                  )}
                >
                  {tab.tint && (
                    <span
                      aria-hidden
                      className={cn("h-2 w-1.5 rounded-t-full", tab.tint)}
                    />
                  )}
                  {tab.label}
                </Link>
              ))}
            </nav>
            {project && (
              <Link
                href={href({ project: null })}
                replace
                aria-label={`Show everything, not only ${project.title}`}
                className="inline-flex h-8 max-w-[260px] items-center gap-1.5 rounded-control bg-surface-3 px-2.5 text-[13px] font-medium text-fg transition-colors hover:bg-surface-2"
              >
                <span className="truncate">{project.title}</span>
                <X className="size-3.5 shrink-0 text-mute" />
              </Link>
            )}
            <div className="flex w-full items-center gap-2 md:hidden">
              <SearchField value={search} onChange={setSearch} />
              {!readOnly && (
                <FavouritesToggle
                  on={favorites}
                  href={href({ fav: !favorites })}
                />
              )}
            </div>
          </div>
        </div>

        <div
          aria-busy={searching}
          className={cn(
            "px-3 pb-16 pt-6 transition-opacity duration-150 lg:px-6",
            searching && "opacity-60"
          )}
        >
          {items.length === 0 ? (
            <div className="mx-auto max-w-[420px] py-24 text-center">
              <p className="text-[15px]">
                {filtered ? "Nothing matches." : "Nothing made yet."}
              </p>
              <p className="mt-1 text-[13px] text-mute">
                {filtered
                  ? "Try another word, or clear the filters."
                  : "Everything you make in the Studio lands here."}
              </p>
              <Link
                href={filtered ? "/library" : "/studio"}
                className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}
              >
                {filtered ? "Clear the filters" : "Open the Studio"}
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((group) => {
                const visual = group.items.filter(
                  (a) => a.kind === "image" || a.kind === "video"
                );
                const audio = group.items.filter(
                  (a) => a.kind === "music" || a.kind === "sound"
                );
                return (
                  <section key={group.day} aria-labelledby={`day-${group.day}`}>
                    <h2
                      id={`day-${group.day}`}
                      className="mb-3 text-[13px] font-medium text-mute"
                    >
                      {group.label}
                    </h2>
                    {visual.length > 0 && (
                      <div className="columns-2 gap-2 md:columns-3 xl:columns-4">
                        {visual.map((a) => (
                          <Tile
                            key={a.id}
                            asset={{
                              ...a,
                              createdAt: a.createdAt.toISOString(),
                            }}
                            selected={selected.has(a.id)}
                            onSelect={select}
                          />
                        ))}
                      </div>
                    )}
                    {audio.length > 0 && (
                      // one column until there is room for two full rows (TICKET-053)
                      <div
                        className={cn(
                          "grid gap-2 xl:grid-cols-2",
                          visual.length > 0 && "mt-2"
                        )}
                      >
                        {audio.map((a) => (
                          <AudioRow
                            key={a.id}
                            className="min-w-0"
                            src={a.url}
                            title={
                              titleFrom(a.prompt) ||
                              (a.kind === "music" ? "Track" : "Sound")
                            }
                            subtitle={
                              a.kind === "music" ? "Music" : "Sound effect"
                            }
                            seconds={a.durationSec ?? undefined}
                            action={
                              <>
                                <MediaMenu
                                  actions={actionsFor(
                                    {
                                      url: a.url,
                                      kind: a.kind,
                                      prompt: a.prompt,
                                      assetId: a.id,
                                      favorite: a.favorite,
                                    },
                                    handlers
                                  ).filter((x) => x.id !== "download")}
                                  label={titleFrom(a.prompt) || "the track"}
                                  className="size-8 bg-transparent text-mute hover:bg-surface-2 hover:text-fg"
                                />
                                <Link
                                  href={`/library/a/${a.id}`}
                                  scroll={false}
                                  aria-label={`Open details for ${
                                    titleFrom(a.prompt) ||
                                    (a.kind === "music"
                                      ? "the track"
                                      : "the sound")
                                  }`}
                                  className="grid size-8 shrink-0 place-items-center rounded-control text-mute transition-colors hover:bg-surface-2 hover:text-fg"
                                >
                                  <Maximize2 className="size-4" />
                                </Link>
                              </>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
              {cursor && (
                <div
                  ref={end}
                  className="columns-2 gap-2 md:columns-3 xl:columns-4"
                >
                  {loading &&
                    Array.from({ length: 4 }, (_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: placeholders
                      <Skeleton key={i} className="mb-2 aspect-square" />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
        {selected.size > 0 && (
          <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <div className="flex items-center gap-2 rounded-panel border border-border bg-surface-2 px-3 py-2 text-[13px] shadow-float">
              <span className="tabular px-1 text-fg-2">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={() => {
                  for (const a of chosen)
                    void downloadFile(a.url, fileNameFrom(a.prompt, a.kind));
                }}
                className="rounded-control px-2.5 py-1.5 text-fg transition-colors hover:bg-surface-3"
              >
                Download
              </button>
              {!readOnly &&
                (confirmDelete ? (
                  <button
                    type="button"
                    onClick={deleteChosen}
                    className="rounded-control bg-destructive px-2.5 py-1.5 text-destructive-foreground"
                  >
                    Delete {selected.size} for good
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-control px-2.5 py-1.5 text-fg transition-colors hover:bg-surface-3"
                  >
                    Delete
                  </button>
                ))}
              <button
                type="button"
                onClick={() => {
                  setSelected(new Set());
                  setConfirmDelete(false);
                }}
                className="rounded-control px-2.5 py-1.5 text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </MediaHandlersProvider>
  );
}

function Tile({
  asset,
  selected,
  onSelect,
}: {
  asset: LibraryAsset;
  selected: boolean;
  /** ⌘ or ⇧ selects instead of opening (TICKET-063). */
  onSelect: (asset: LibraryAsset, toggle: boolean) => boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ratio =
    asset.width && asset.height
      ? `${asset.width}/${asset.height}`
      : asset.kind === "video"
        ? "16/9"
        : undefined;
  return (
    <figure
      className={cn(
        "group relative mb-2 overflow-hidden rounded-media bg-surface [break-inside:avoid]",
        selected && "ring-2 ring-fg ring-offset-2 ring-offset-bg"
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
      onMouseEnter={() => video.current?.play().catch(() => {})}
      onMouseLeave={() => video.current?.pause()}
    >
      <Link
        href={`/library/a/${asset.id}`}
        scroll={false}
        onClick={(event) => {
          if (onSelect(asset, event.metaKey || event.ctrlKey || event.shiftKey))
            event.preventDefault();
        }}
        aria-pressed={selected || undefined}
        // inset: the figure clips anything drawn outside it
        className="block size-full focus-visible:outline-offset-[-3px]"
        aria-label={asset.prompt}
      >
        {asset.kind === "video" ? (
          <video
            ref={video}
            src={asset.url}
            muted
            loop
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : (
          <RevealImage
            src={asset.url}
            alt={asset.prompt}
            loading="lazy"
            width={asset.width ?? undefined}
            height={asset.height ?? undefined}
            className="block size-full object-cover"
          />
        )}
      </Link>
      {asset.kind === "video" && asset.durationSec && (
        <span className="tabular pointer-events-none absolute bottom-2 left-2 rounded-chip bg-bg/60 px-1.5 py-0.5 text-[11.5px] text-fg backdrop-blur">
          {formatDuration(asset.durationSec)}
        </span>
      )}
      {asset.favorite && (
        <Heart
          aria-label="In favourites"
          className="absolute left-2 top-2 size-4 fill-current text-fg drop-shadow"
        />
      )}
      {selected && (
        <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-fg text-bg">
          <Check className="size-3.5" />
        </span>
      )}
      <HoverActions
        item={{
          url: asset.url,
          kind: asset.kind,
          prompt: asset.prompt,
          assetId: asset.id,
          favorite: asset.favorite,
        }}
        label={asset.prompt}
      />
    </figure>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative block w-full md:w-64">
      <span className="sr-only">Search what you have made</span>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search what you have made…"
        autoComplete="off"
        className="h-8 w-full rounded-control border border-border bg-surface pl-8 pr-2 text-[13px] text-fg transition-colors placeholder:text-mute hover:border-border-strong focus-visible:border-fg/50 [&::-webkit-search-cancel-button]:opacity-50"
      />
    </label>
  );
}

function FavouritesToggle({ on, href }: { on: boolean; href: string }) {
  return (
    <Link
      href={href}
      replace
      aria-current={on ? "true" : undefined}
      title={on ? "Showing favourites only" : "Show favourites only"}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border px-2.5 text-[13px] font-medium transition-colors",
        on
          ? "border-transparent bg-surface-3 text-fg"
          : "border-border text-fg-2 hover:text-fg"
      )}
    >
      <Heart className={cn("size-3.5", on && "fill-current")} /> Favourites
    </Link>
  );
}
