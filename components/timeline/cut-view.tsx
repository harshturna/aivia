"use client";

import {
  Download,
  Minus,
  Pause,
  Play,
  Plus,
  Redo2,
  Scissors,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type MediaHandlers,
  MediaHandlersProvider,
} from "@/components/media/actions";
import { MediaTray } from "@/components/media/tray";
import { ScreenHeader } from "@/components/shell/screen";
import { measure } from "@/components/studio/measure";
import { takeFor } from "@/components/studio/piece-request";
import { Button } from "@/components/ui/button";
import { userProModal } from "@/hooks/useProModal";
import { downloadFile, fileNameFrom } from "@/lib/download";
import { formatDuration } from "@/lib/duration";
import {
  getLocalSession,
  listLocalEdits,
  saveLocalEdit,
  saveLocalSession,
} from "@/lib/guest-local";
import { type MediaItem, mediaByBrief, withVersions } from "@/lib/media";
import { uploadMedia } from "@/lib/storage";
import {
  addAudio,
  addText,
  addToMain,
  findItem,
  remove,
  replaceMedia,
  split,
} from "@/lib/timeline/ops";
import {
  docDuration,
  type Item,
  type Media,
  type TimelineDoc,
} from "@/lib/timeline/schema";
import { cn } from "@/lib/utils";
import { probeVideo, type Rendered, renderTimeline } from "./export";
import { commitTo, type History, startHistory, stepIn } from "./history";
import { Inspector, type TakeState, type TakeUI } from "./inspector";
import { startingCut } from "./start";
import { Storyboard } from "./storyboard";
import { makeTake } from "./take";
import { Timeline } from "./timeline";
import { usePlayer } from "./use-player";

/**
 * Cut (D-005 §17.5, TICKET-065): the project's film, edited. The player on top, the timeline
 * below, the project's media on the right with the selected item's settings at its foot.
 * Saves as you go (the account's edit with its rev; the guest's in this browser), exports in
 * the browser, and keeps the export in the project when signed in.
 */
export const MAX_EXPORT_MS = 60_000;
const NO_VERSIONS: MediaItem[] = [];
const ADD_KEY = (project: string) => `aivia:add-to-cut:${project}`;

type Message = { id: string; role: string; parts: unknown[] };
type Saved = { id: string; rev: number; doc: TimelineDoc } | null;

/** Leaves a piece for the Cut view to add when it opens (from the Make view). */
export function queueForCut(projectId: string, item: MediaItem) {
  try {
    const key = ADD_KEY(projectId);
    const list = JSON.parse(sessionStorage.getItem(key) ?? "[]") as MediaItem[];
    sessionStorage.setItem(key, JSON.stringify([...list, item]));
  } catch {}
}

async function mediaOf(item: MediaItem): Promise<Media> {
  if (item.kind === "video") {
    const probed = await probeVideo(item.url).catch(() => null);
    return {
      url: item.url,
      kind: "video",
      ...(probed ? { durationMs: probed.durationMs } : {}),
    };
  }
  if (item.kind === "image") return { url: item.url, kind: "image" };
  const length = await new Promise<number | undefined>((resolve) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () =>
      resolve(
        Number.isFinite(a.duration) ? Math.round(a.duration * 1000) : undefined
      );
    a.onerror = () => resolve(undefined);
    a.src = item.url;
  });
  return {
    url: item.url,
    kind: item.kind,
    ...(length ? { durationMs: length } : {}),
  };
}

export function CutView({
  projectId,
  title: initialTitle,
  isGuest,
  initialMessages,
  saved: initialSaved,
  run,
  versions = NO_VERSIONS,
  newer = false,
}: {
  projectId: string;
  title: string;
  isGuest: boolean;
  /** The project's runs; a guest's browser project reads its own. */
  initialMessages: Message[] | null;
  saved: Saved;
  /** "Cut it together" on a run: start from that run if there is no cut yet. */
  run: string | null;
  /** The project's edited images and kept cuts, on top of the tray (TICKET-067). */
  versions?: MediaItem[];
  /** The project's cut was saved by a newer version of the app. */
  newer?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [title, setTitle] = useState(initialTitle);
  const [doc, setDoc] = useState<TimelineDoc | null>(initialSaved?.doc ?? null);
  // the cut as it is now, for work that finishes later (a probe, a take, a queued piece):
  // it builds on this, never on the cut it started from (TICKET-071)
  const docNow = useRef(doc);
  const [history, setHistoryState] = useState(() =>
    startHistory(initialSaved?.doc ?? null)
  );
  const historyNow = useRef(history);
  const setHistory = useCallback((h: History<TimelineDoc>) => {
    historyNow.current = h;
    setHistoryState(h);
  }, []);
  const setCut = useCallback((next: TimelineDoc | null) => {
    docNow.current = next;
    setDoc(next);
  }, []);
  // a guest's cut is read from this browser after the first render; nothing builds on the
  // cut until it has been
  const [ready, setReady] = useState(!isGuest);
  const saved = useRef<{ id: string; rev: number } | null>(
    initialSaved ? { id: initialSaved.id, rev: initialSaved.rev } : null
  );
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "conflict" | "error"
  >("idle");
  const [starting, setStarting] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pxPerSec, setPxPerSec] = useState(60);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [exporting, setExporting] = useState<
    | null
    | { at: "rendering"; progress: number; abort: AbortController }
    | {
        at: "done";
        result: Rendered;
        url: string;
        kept: "no" | "keeping" | "yes" | "failed";
      }
    | { at: "failed"; message: string }
  >(null);

  // a guest's browser project: its runs and its cut live here
  useEffect(() => {
    if (!isGuest) return;
    if (!initialMessages) {
      const local = getLocalSession(projectId);
      setMessages((local?.messages ?? []) as unknown as Message[]);
      if (local?.title) setTitle(local.title);
    }
    if (!initialSaved) {
      const local = listLocalEdits().find((e) => e.projectId === projectId);
      if (local) {
        saved.current = { id: local.id, rev: 0 };
        setCut(local.doc);
        setHistory(startHistory(local.doc));
      }
    }
    setReady(true);
  }, [isGuest, initialMessages, initialSaved, projectId, setCut, setHistory]);

  const working = doc ?? null;
  const player = usePlayer(
    working ?? {
      schema: "aivia.timeline",
      version: 1,
      fps: 24,
      width: 1280,
      height: 720,
      media: {},
      tracks: [],
    },
    canvas
  );

  // a cut opens a second in, where something is on screen, not on the black before a fade
  const opened = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, when the cut first exists
  useEffect(() => {
    if (opened.current || !doc) return;
    opened.current = true;
    player.seek(Math.min(1000, docDuration(doc) / 2));
  }, [Boolean(doc)]);

  // ── saving: one request at a time; what changed meanwhile goes next (TICKET-071) ──────
  const save = useCallback(
    async (next: TimelineDoc, keepalive = false): Promise<boolean> => {
      if (isGuest) {
        const id = saved.current?.id ?? crypto.randomUUID();
        saved.current = { id, rev: 0 };
        const ok = saveLocalEdit({ id, projectId, title, doc: next });
        setStatus(ok ? "saved" : "error");
        return ok;
      }
      setStatus("saving");
      try {
        if (!saved.current) {
          const res = await fetch("/api/edits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, title, doc: next }),
            keepalive,
          });
          if (!res.ok) throw new Error();
          const made = (await res.json()) as { id: string; rev: number };
          saved.current = { id: made.id, rev: made.rev };
        } else {
          const res = await fetch(`/api/edits/${saved.current.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rev: saved.current.rev, doc: next }),
            keepalive,
          });
          if (res.status === 409) {
            setStatus("conflict");
            return false;
          }
          if (!res.ok) throw new Error();
          saved.current.rev = ((await res.json()) as { rev: number }).rev;
        }
        setStatus("saved");
        return true;
      } catch {
        setStatus("error");
        return false;
      }
    },
    [isGuest, projectId, title]
  );
  const inFlight = useRef(false);
  const queued = useRef<TimelineDoc | null>(null);
  const persist = useCallback(
    async (first: TimelineDoc) => {
      if (inFlight.current) {
        queued.current = first;
        return;
      }
      inFlight.current = true;
      let next: TimelineDoc | null = first;
      while (next) {
        queued.current = null;
        // a conflict stops here: the newer cut is in another tab
        if (!(await save(next))) break;
        next = queued.current;
      }
      queued.current = null;
      inFlight.current = false;
    },
    [save]
  );

  // saved a moment after the last change, and when the page goes away
  const pending = useRef<TimelineDoc | null>(null);
  const timer = useRef(0);
  const scheduleSave = useCallback(
    (next: TimelineDoc) => {
      pending.current = next;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const d = pending.current;
        pending.current = null;
        if (d) void persist(d);
      }, 800);
    },
    [persist]
  );
  useEffect(() => {
    const flush = () => {
      window.clearTimeout(timer.current);
      const d = pending.current ?? queued.current;
      pending.current = null;
      queued.current = null;
      // keepalive lets the request finish after the page has gone
      if (d) void save(d, true);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [save]);

  // ── editing: every landed change is one undo step; a no-op is none; typing merges ────
  const change = useCallback(
    (next: TimelineDoc, commit: boolean, key?: string) => {
      setCut(next);
      if (!commit) return;
      const h = historyNow.current;
      const after = commitTo(h, next, key);
      if (after === h) return;
      setHistory(after);
      scheduleSave(next);
    },
    [scheduleSave, setCut, setHistory]
  );
  const stepBy = useCallback(
    (by: -1 | 1) => {
      const r = stepIn(historyNow.current, by);
      if (!r) return;
      setHistory(r.history);
      setCut(r.doc);
      scheduleSave(r.doc);
    },
    [scheduleSave, setCut, setHistory]
  );
  const undo = useCallback(() => stepBy(-1), [stepBy]);
  const redo = useCallback(() => stepBy(1), [stepBy]);

  const start = useCallback(
    async (fromRun: string | null) => {
      setStarting(true);
      const first = await startingCut(messages, fromRun).catch(() => null);
      setStarting(false);
      if (!first) return;
      setCut(first);
      setHistory(startHistory(first));
      setSelected(null);
      void persist(first);
      // fit the new cut to the timeline's width
      setPxPerSec(
        Math.max(
          12,
          Math.min(160, 900 / Math.max(1, docDuration(first) / 1000))
        )
      );
    },
    [messages, persist, setCut, setHistory]
  );

  // "Cut it together" on a run starts the cut when there is none yet
  const started = useRef(false);
  useEffect(() => {
    if (started.current || doc || !messages.length || newer) return;
    if (!run && !initialSaved && !isGuest) return;
    if (isGuest && listLocalEdits().some((e) => e.projectId === projectId))
      return;
    if (!run) return;
    started.current = true;
    void start(run);
  }, [
    run,
    doc,
    messages.length,
    start,
    initialSaved,
    isGuest,
    projectId,
    newer,
  ]);

  const addPiece = useCallback(
    async (item: MediaItem, at?: { ms: number; row: string }) => {
      const media = await mediaOf(item);
      const base = docNow.current ?? (await startingCut([], null));
      let next: TimelineDoc;
      if (item.kind === "music" || item.kind === "sound") {
        next = addAudio(base, media, at?.ms ?? 0).doc;
      } else {
        const main = base.tracks.find((t) => t.kind === "main");
        const index =
          at && main?.kind === "main"
            ? main.items.filter((i) => i.start + i.duration / 2 < at.ms).length
            : undefined;
        next = addToMain(base, media, index).doc;
      }
      change(next, true);
    },
    [change]
  );

  // pieces sent here from the Make view
  // biome-ignore lint/correctness/useExhaustiveDependencies: once the cut is open
  useEffect(() => {
    if (starting || !ready) return;
    try {
      const key = ADD_KEY(projectId);
      const list = JSON.parse(
        sessionStorage.getItem(key) ?? "[]"
      ) as MediaItem[];
      if (!list.length) return;
      sessionStorage.removeItem(key);
      void (async () => {
        for (const item of list) await addPiece(item);
      })();
    } catch {}
  }, [starting, ready, Boolean(doc)]);

  // ── the keyboard: only when focus is in the editor and not in a field ──────────────────
  const splitAtPlayhead = useCallback(() => {
    if (!doc) return;
    const t = player.time;
    const target =
      (selected && findItem(doc, selected)) ||
      doc.tracks
        .flatMap((tr) =>
          (tr.items as Item[]).map((item) => ({ item, track: tr }))
        )
        .find(
          ({ item, track }) =>
            track.kind === "main" &&
            item.start < t &&
            item.start + item.duration > t
        );
    if (!target) return;
    const r = split(doc, target.item.id, t);
    if (r.id) change(r.doc, true);
  }, [doc, player.time, selected, change]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable=true], [role=dialog]"))
        return;
      const mod = event.metaKey || event.ctrlKey;
      if (event.key === " ") {
        event.preventDefault();
        player.toggle();
      } else if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "s" && !mod) {
        event.preventDefault();
        splitAtPlayhead();
      } else if (mod && event.key.toLowerCase() === "b") {
        event.preventDefault();
        splitAtPlayhead();
      } else if (
        (event.key === "Backspace" || event.key === "Delete") &&
        selected &&
        doc
      ) {
        event.preventDefault();
        change(remove(doc, selected), true);
        setSelected(null);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const step =
          (event.shiftKey ? 1000 : 1000 / (doc?.fps ?? 24)) *
          (event.key === "ArrowLeft" ? -1 : 1);
        player.seek(player.time + step);
      } else if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, undo, redo, splitAtPlayhead, selected, doc, change]);

  // a finished export's file is freed when the view goes, as on Close
  const exportUrl = useRef<string | null>(null);
  exportUrl.current = exporting?.at === "done" ? exporting.url : null;
  useEffect(
    () => () => {
      if (exportUrl.current) URL.revokeObjectURL(exportUrl.current);
    },
    []
  );

  // ── export ────────────────────────────────────────────────────────────────────────
  const length = doc ? docDuration(doc) : 0;
  const exportCut = async () => {
    if (!doc || length > MAX_EXPORT_MS) return;
    player.pause();
    const abort = new AbortController();
    setExporting({ at: "rendering", progress: 0, abort });
    try {
      const result = await renderTimeline(
        doc,
        (progress) =>
          setExporting((e) => (e?.at === "rendering" ? { ...e, progress } : e)),
        abort.signal
      );
      setExporting({
        at: "done",
        result,
        url: URL.createObjectURL(result.blob),
        kept: "no",
      });
    } catch (error) {
      if (abort.signal.aborted) setExporting(null);
      else
        setExporting({
          at: "failed",
          message:
            error instanceof Error
              ? error.message
              : "The export did not finish.",
        });
    }
  };
  const keep = async () => {
    if (exporting?.at !== "done") return;
    setExporting({ ...exporting, kept: "keeping" });
    try {
      const path = await uploadMedia(
        exporting.result.blob,
        exporting.result.ext
      );
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          title,
          seconds: exporting.result.seconds,
          width: exporting.result.width,
          height: exporting.result.height,
          sessionId: projectId,
          editId: saved.current?.id,
        }),
      });
      setExporting((e) =>
        e?.at === "done" ? { ...e, kept: res.ok ? "yes" : "failed" } : e
      );
    } catch {
      setExporting((e) => (e?.at === "done" ? { ...e, kept: "failed" } : e));
    }
  };

  const groups = useMemo(
    () => withVersions(versions, mediaByBrief(messages as never)),
    [messages, versions]
  );
  const labels = useMemo(() => {
    const prompts = new Map(
      groups.flatMap((g) => g.items.map((i) => [i.url, i.prompt] as const))
    );
    return (item: Item) => {
      if (item.type === "text") return item.text;
      const media = doc?.media[item.media];
      const prompt = media ? prompts.get(media.url) : undefined;
      return (
        prompt ||
        (item.type === "video"
          ? "Clip"
          : item.type === "image"
            ? "Still"
            : "Sound")
      );
    };
  }, [groups, doc]);

  // ── New take: the piece made again from its brief, swapped in where it stands ─────────
  const proModal = userProModal();
  const [take, setTake] = useState<TakeState>({ at: "idle" });
  const taking = useRef(false);
  const runTake = useCallback(
    async (url: string) => {
      // claimed before anything awaits: a second click cannot start a second paid take
      if (taking.current) return;
      taking.current = true;
      setTake({ at: "working", url });
      const used = Object.values(docNow.current?.media ?? {}).find(
        (m) => m.url === url
      );
      // the piece's own shape, for a run that did not name one
      const size = await measure(
        url,
        used?.kind === "video" ? "video" : "image"
      );
      const request = takeFor(messages as never, url, size);
      if (!request) {
        taking.current = false;
        setTake({ at: "idle" });
        return;
      }
      const r = await makeTake(projectId, messages as never, request);
      taking.current = false;
      // the run is kept as the server keeps it, whether or not it made something
      if (r.messages) {
        setMessages(r.messages as unknown as Message[]);
        const local = isGuest ? getLocalSession(projectId) : null;
        if (local)
          saveLocalSession({
            ...local,
            messages: r.messages as unknown as typeof local.messages,
          });
      }
      if (!r.ok) {
        setTake(
          r.limit
            ? { at: "limit", who: r.limit }
            : { at: "failed", url, message: r.message }
        );
        return;
      }
      const media = await mediaOf({
        url: r.url,
        kind: request.mode === "video" ? "video" : "image",
        prompt: request.prompt,
      });
      const current = docNow.current;
      if (current) change(replaceMedia(current, url, media), true);
      setTake({ at: "idle" });
    },
    [messages, projectId, isGuest, change]
  );
  const takeUI = useMemo<TakeUI>(
    () => ({
      canTake: (url) => Boolean(takeFor(messages as never, url)),
      state: take,
      run: (url) => void runTake(url),
      onUpgrade: proModal.onOpen,
    }),
    [messages, take, runTake, proModal.onOpen]
  );

  const handlers = useMemo<MediaHandlers>(
    () => ({
      addToCut: (item) => void addPiece(item),
      newTake:
        take.at === "working" || take.at === "limit"
          ? undefined
          : (item) => {
              if (item.kind === "image" || item.kind === "video")
                void runTake(item.url);
            },
      canTake: (item) => Boolean(takeFor(messages as never, item.url)),
    }),
    [addPiece, runTake, take.at, messages]
  );

  return (
    <MediaHandlersProvider value={handlers}>
      <div className="relative flex h-dvh min-h-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <ScreenHeader title={title}>
            <ProjectViews projectId={projectId} view="cut" />
            <span
              className={`whitespace-nowrap text-[12.5px] text-mute ${
                status === "conflict" ||
                status === "error" ||
                take.at === "working"
                  ? "inline"
                  : "hidden xl:inline"
              }`}
              aria-live="polite"
            >
              {take.at === "working"
                ? "Making a new take…"
                : status === "saving"
                  ? "Saving…"
                  : status === "saved"
                    ? isGuest
                      ? "Saved in this browser"
                      : "Saved"
                    : status === "conflict"
                      ? "Changed in another tab. Reload to see it."
                      : status === "error"
                        ? "Not saved. Check the connection."
                        : ""}
            </span>
            {doc && (
              <Button
                size="sm"
                onClick={exportCut}
                disabled={
                  length <= 0 ||
                  length > MAX_EXPORT_MS ||
                  exporting?.at === "rendering"
                }
                title={
                  length > MAX_EXPORT_MS
                    ? "A cut can be up to a minute long"
                    : undefined
                }
              >
                <Download /> Export
              </Button>
            )}
          </ScreenHeader>

          {!doc ? (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div className="max-w-[420px]">
                {newer ? (
                  <>
                    <p className="text-[15px]">
                      This cut was made by a newer version of Aivia
                    </p>
                    <p className="mt-1 text-[13px] text-mute">
                      Reload the page to open it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[15px]">No cut yet</p>
                    <p className="mt-1 text-[13px] text-mute">
                      Start from what this project made: a title card, the clips
                      with crossfades, the poster as the end card and the score
                      underneath, all yours to change.
                    </p>
                    <Button
                      className="mt-5"
                      onClick={() => start(run)}
                      disabled={starting || !groups.length}
                    >
                      {starting ? "Laying it out…" : "Start a cut"}
                    </Button>
                    {!groups.length && (
                      <p className="mt-3 text-[12.5px] text-mute">
                        Make something in this project first.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* the stage */}
              <div className="grid shrink-0 place-items-center bg-surface/40 p-3 lg:min-h-0 lg:flex-1 lg:p-4">
                <canvas
                  ref={canvas}
                  className="max-h-full max-w-full rounded-media bg-bg shadow-float"
                  style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
                  role="img"
                  aria-label="The cut"
                />
              </div>
              {/* the controls */}
              <div className="flex h-11 shrink-0 items-center gap-1 border-t border-border px-3 text-[13px]">
                <IconButton
                  label={player.playing ? "Pause (Space)" : "Play (Space)"}
                  onClick={player.toggle}
                >
                  {player.playing ? (
                    <Pause className="fill-current" />
                  ) : (
                    <Play className="fill-current" />
                  )}
                </IconButton>
                <span className="tabular w-[92px] text-fg-2">
                  {formatDuration(player.time / 1000)} /{" "}
                  {formatDuration(length / 1000)}
                </span>
                {player.loading && (
                  <span className="text-mute">Loading sound…</span>
                )}
                {/* split and cards belong to the timeline; the storyboard has its own */}
                <div className="hidden lg:contents">
                  <span className="mx-1 h-5 w-px bg-border" />
                  <IconButton
                    label="Split at the playhead (S)"
                    onClick={splitAtPlayhead}
                  >
                    <Scissors />
                  </IconButton>
                  <IconButton
                    label="Remove (Delete)"
                    disabled={!selected}
                    onClick={() => {
                      if (doc && selected) change(remove(doc, selected), true);
                      setSelected(null);
                    }}
                  >
                    <Trash2 />
                  </IconButton>
                  <IconButton
                    label="Add a text card at the playhead"
                    onClick={() => {
                      const r = addText(doc, player.time);
                      change(r.doc, true);
                      setSelected(r.id);
                    }}
                  >
                    <Type />
                  </IconButton>
                </div>
                <IconButton
                  label="Undo (⌘Z)"
                  disabled={history.at <= 0}
                  onClick={undo}
                >
                  <Undo2 />
                </IconButton>
                <IconButton
                  label="Redo (⇧⌘Z)"
                  disabled={history.at >= history.stack.length - 1}
                  onClick={redo}
                >
                  <Redo2 />
                </IconButton>
                <span className="ml-auto" />
                {length > MAX_EXPORT_MS && (
                  <span className="mr-2 text-mute">
                    Over a minute: trim to export
                  </span>
                )}
                <div className="hidden lg:contents">
                  <IconButton
                    label="Zoom out"
                    onClick={() => setPxPerSec((z) => Math.max(8, z / 1.4))}
                  >
                    <Minus />
                  </IconButton>
                  <IconButton
                    label="Zoom in"
                    onClick={() => setPxPerSec((z) => Math.min(400, z * 1.4))}
                  >
                    <Plus />
                  </IconButton>
                  <button
                    type="button"
                    onClick={() =>
                      setPxPerSec(
                        Math.max(
                          8,
                          Math.min(400, 900 / Math.max(1, length / 1000))
                        )
                      )
                    }
                    className="rounded-control px-2 py-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    Fit
                  </button>
                </div>
              </div>
              {/* the timeline: wide screens; the storyboard serves phones (TICKET-066) */}
              <div className="hidden h-[272px] shrink-0 lg:block">
                <Timeline
                  doc={doc}
                  pxPerSec={pxPerSec}
                  onZoom={(z) => setPxPerSec(z)}
                  selected={selected}
                  onSelect={setSelected}
                  onChange={change}
                  onTick={player.onTick}
                  onSeek={player.seek}
                  onDropMedia={(item, ms, row) =>
                    void addPiece(item, { ms, row })
                  }
                  labelOf={labels}
                />
              </div>
              {/* the storyboard: phones and narrow windows (§17.4) */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border lg:hidden">
                <Storyboard
                  doc={doc}
                  onChange={change}
                  labelOf={labels}
                  time={player.time}
                  onSeek={player.seek}
                  take={takeUI}
                />
              </div>
            </>
          )}
        </div>

        <aside
          aria-label="Media"
          className="hidden h-dvh w-[300px] shrink-0 border-l border-border bg-bg lg:block"
        >
          <MediaTray
            groups={groups}
            // adding is deliberate here: a drag onto the timeline, or Add to cut in "⋯"
            onOpen={() => {}}
            hint="Drag a piece onto the timeline, or choose Add to cut in its menu."
            footer={
              doc ? (
                <Inspector
                  doc={doc}
                  selected={selected}
                  onChange={change}
                  onDeselect={() => setSelected(null)}
                  take={takeUI}
                />
              ) : undefined
            }
          />
        </aside>

        {exporting && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-scrim p-4 backdrop-blur-sm">
            <div className="w-full max-w-[560px] rounded-panel border border-border bg-surface-2 p-6 shadow-float">
              <h2 className="text-[17px] font-medium">Export</h2>
              {exporting.at === "rendering" && (
                <>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full bg-sun transition-[width]"
                      style={{
                        width: `${Math.round(exporting.progress * 100)}%`,
                      }}
                    />
                  </div>
                  <p
                    className="tabular mt-2 text-[13px] text-fg-2"
                    aria-live="polite"
                  >
                    Making the film, {Math.round(exporting.progress * 100)}%
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => exporting.abort.abort()}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {exporting.at === "failed" && (
                <>
                  <p role="alert" className="mt-3 text-[13.5px] text-fg-2">
                    {exporting.message}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setExporting(null)}
                  >
                    Close
                  </Button>
                </>
              )}
              {exporting.at === "done" && (
                <>
                  <video
                    src={exporting.url}
                    controls
                    playsInline
                    className="mt-4 max-h-[50vh] w-full rounded-media bg-bg"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        downloadFile(exporting.url, fileNameFrom(title, "cut"))
                      }
                    >
                      <Download /> Download
                    </Button>
                    {!isGuest && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={keep}
                        disabled={
                          exporting.kept === "keeping" ||
                          exporting.kept === "yes"
                        }
                      >
                        {exporting.kept === "yes"
                          ? "In the project"
                          : exporting.kept === "keeping"
                            ? "Keeping…"
                            : "Keep in project"}
                      </Button>
                    )}
                    {exporting.kept === "failed" && (
                      <span role="alert" className="text-[13px] text-fg-2">
                        It was not kept. Try again.
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        URL.revokeObjectURL(exporting.url);
                        setExporting(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </MediaHandlersProvider>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

/** Make | Cut, in a project's header (§17.2). */
export function ProjectViews({
  projectId,
  view,
}: {
  projectId: string;
  view: "make" | "cut";
}) {
  return (
    <nav
      aria-label="Project"
      className="inline-flex rounded-control border border-border p-0.5 text-[13px] font-medium"
    >
      {(
        [
          ["make", "Make", `/p/${projectId}`],
          ["cut", "Cut", `/p/${projectId}/cut`],
        ] as const
      ).map(([id, label, href]) => (
        <Link
          key={id}
          href={href}
          aria-current={view === id ? "page" : undefined}
          className={cn(
            "rounded-chip px-3 py-1 transition-colors",
            view === id ? "bg-surface-3 text-fg" : "text-fg-2 hover:text-fg"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
