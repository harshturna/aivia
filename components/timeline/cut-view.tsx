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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type MediaHandlers,
  MediaHandlersProvider,
} from "@/components/media/actions";
import { MediaSheet } from "@/components/media/media-sheet";
import { MediaTray } from "@/components/media/tray";
import { ProjectTabs, TABS_ROOM } from "@/components/shell/project-tabs";
import { ScreenHeader } from "@/components/shell/screen";
import { measure } from "@/components/studio/measure";
import { takeFor } from "@/components/studio/piece-request";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { userProModal } from "@/hooks/useProModal";
import { downloadFile, fileNameFrom } from "@/lib/download";
import {
  getLocalSession,
  listLocalEdits,
  saveLocalEdit,
  saveLocalSession,
} from "@/lib/guest-local";
import { type MediaItem, mediaByBrief, withVersions } from "@/lib/media";
import { shortName } from "@/lib/short-name";
import { uploadMedia } from "@/lib/storage";
import {
  addAudio,
  addText,
  addToMain,
  findItem,
  moveFree,
  moveMain,
  remove,
  replaceMedia,
  split,
  trimEnd,
  trimStart,
} from "@/lib/timeline/ops";
import {
  docDuration,
  endOf,
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
const MIN_ZOOM = 8;
const MAX_ZOOM = 400;
/** The timeline's label column (timeline.tsx). */
const GUTTER = 84;

/** m:ss.t, so a frame step shows. */
const formatTenths = (ms: number) => {
  const t = Math.max(0, Math.round(ms / 100)) / 10;
  return `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
};
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
  const router = useRouter();
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
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pxPerSec, setPxPerSec] = useState(60);
  // Fit fills the timeline's real width, measured (TICKET-074)
  const lane = useRef<HTMLDivElement>(null);
  const fitZoom = useCallback((ms: number) => {
    const room = (lane.current?.clientWidth || 900) - GUTTER - 32;
    return Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, room / Math.max(1, ms / 1000))
    );
  }, []);
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

  // a saved cut opens fitted to the timeline's width (TICKET-080)
  const fitted = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, when the cut first exists
  useEffect(() => {
    if (fitted.current || !doc) return;
    fitted.current = true;
    setPxPerSec(fitZoom(docDuration(doc)));
  }, [Boolean(doc)]);

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
      setPxPerSec(fitZoom(docDuration(first)));
    },
    [messages, persist, setCut, setHistory, fitZoom]
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
      // no cut yet: start from the project's own layout, as Start a cut does, then add the
      // piece to it (TICKET-080: it made a cut of one piece)
      const fresh = !docNow.current;
      const base = docNow.current ?? (await startingCut(messages, null));
      const existing = fresh
        ? Object.entries(base.media).find(([, m]) => m.url === item.url)?.[0]
        : undefined;
      if (existing) {
        change(base, true);
        const already = base.tracks
          .flatMap((t) => t.items as Item[])
          .find((i) => "media" in i && i.media === existing);
        if (already) setSelected(already.id);
        setPxPerSec(fitZoom(docDuration(base)));
        return;
      }
      let added: { doc: TimelineDoc; id: string };
      if (item.kind === "music" || item.kind === "sound") {
        added = addAudio(base, media, at?.ms ?? 0);
      } else {
        const main = base.tracks.find((t) => t.kind === "main");
        const index =
          at && main?.kind === "main"
            ? main.items.filter((i) => i.start + i.duration / 2 < at.ms).length
            : undefined;
        added = addToMain(base, media, index);
      }
      change(added.doc, true);
      // the new piece is selected, which brings it into view: the add is seen (TICKET-074)
      setSelected(added.id);
      if (fresh) setPxPerSec(fitZoom(docDuration(added.doc)));
    },
    [change, messages, fitZoom]
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
    const t = player.now();
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
  }, [doc, player.now, selected, change]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable=true], [role=dialog]"))
        return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const hit = selected && doc ? findItem(doc, selected) : null;
      // Space on a focused button presses the button; anywhere else it plays
      if (event.key === " ") {
        // Space plays from anywhere in Cut, as it always did; only the play button itself, a
        // slider and a menu item keep their own Space (TICKET-080: it repeated Split and Undo)
        if (
          el.closest(
            'button[aria-label^="Play"], button[aria-label^="Pause"], [role=slider], [role=menuitem]'
          )
        )
          return;
        event.preventDefault();
        player.toggle();
      } else if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((key === "s" && !mod) || (mod && key === "b")) {
        // taken here first (capture), so the sidebar leaves ⌘B to Cut (TICKET-074)
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
      } else if (
        (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        event.altKey &&
        hit &&
        doc
      ) {
        // the keyboard's move: a picture one place along, anything else a frame (Shift: 1 s)
        event.preventDefault();
        const dir = event.key === "ArrowLeft" ? -1 : 1;
        if (hit.track.kind === "main")
          change(
            moveMain(doc, hit.item.id, Math.max(0, hit.index + dir)),
            true
          );
        else
          change(
            moveFree(
              doc,
              hit.item.id,
              hit.item.start + dir * (event.shiftKey ? 1000 : 1000 / doc.fps)
            ),
            true
          );
      } else if ((event.key === "[" || event.key === "]") && hit && doc) {
        // the keyboard's trim: the selected item's start or end to the playhead
        event.preventDefault();
        const t = player.now();
        if (event.key === "[" && t > hit.item.start && t < endOf(hit.item))
          change(trimStart(doc, hit.item.id, t - hit.item.start), true);
        if (event.key === "]" && t > hit.item.start)
          change(trimEnd(doc, hit.item.id, t - endOf(hit.item)), true);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const step =
          (event.shiftKey ? 1000 : 1000 / (doc?.fps ?? 24)) *
          (event.key === "ArrowLeft" ? -1 : 1);
        player.seek(player.now() + step);
      } else if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
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

  /** Esc, the close button or Cancel: a running export stops, a finished one's file is freed. */
  const closeExport = () => {
    if (exporting?.at === "rendering") exporting.abort.abort();
    if (exporting?.at === "done") URL.revokeObjectURL(exporting.url);
    setExporting(null);
  };

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
      const kind =
        item.type === "video"
          ? "Clip"
          : item.type === "image"
            ? "Still"
            : "Sound";
      // what a person would call it, not the brief a model was given (TICKET-077)
      return prompt ? shortName(prompt, kind) : kind;
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
      // a guest's take on an example is kept the way Make keeps it: in their own copy of the
      // project, with this cut and the take in it (TICKET-080: it was lost on leaving)
      if (isGuest && !getLocalSession(projectId) && r.messages && current) {
        const fork = crypto.randomUUID();
        saveLocalSession({
          id: fork,
          title: `${title} (your copy)`,
          messages: r.messages as never,
        });
        saveLocalEdit({
          id: crypto.randomUUID(),
          projectId: fork,
          title,
          doc: replaceMedia(current, url, media),
        });
        setTake({ at: "idle" });
        router.push(`/p/${fork}/cut`);
        return;
      }
      if (current) change(replaceMedia(current, url, media), true);
      setTake({ at: "idle" });
    },
    [messages, projectId, isGuest, change, title, router]
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

  // the tray says which pieces are already in the cut
  const inCut = useMemo(
    () =>
      new Map(
        Object.values(doc?.media ?? {}).map(
          (m) => [m.url, "In the cut"] as const
        )
      ),
    [doc?.media]
  );

  const handlers = useMemo<MediaHandlers>(
    () => ({
      addToCut: (item) => {
        setMediaOpen(false);
        void addPiece(item);
      },
      newTake:
        take.at === "working" || take.at === "limit"
          ? undefined
          : (item) => {
              if (item.kind !== "image" && item.kind !== "video") return;
              setMediaOpen(false);
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
          <ScreenHeader
            title={title}
            beside={
              // below 1024 the tabs at the foot do this
              <ProjectViews
                projectId={projectId}
                view="cut"
                className="max-lg:hidden"
              />
            }
          >
            <span
              className={`whitespace-nowrap text-[12px] text-mute ${
                status === "conflict" || status === "error"
                  ? "inline"
                  : take.at === "working"
                    ? // on a phone the sheet says so, and the title keeps its room
                      "hidden sm:inline"
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
                className="pointer-coarse:h-11"
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
                      <p className="mt-3 text-[12px] text-mute">
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
              <div className="relative shrink-0 bg-surface/40 p-3 lg:min-h-0 lg:flex-1">
                {/* a box with a real height, so the picture is contained in it at any window
                    height (TICKET-080: it spilled over the controls at 800 px tall) */}
                <div className="flex items-center justify-center lg:absolute lg:inset-4">
                  <canvas
                    ref={canvas}
                    // on a short screen (a phone on its side) the stage leaves the storyboard room
                    className="block max-h-full min-h-0 max-w-full min-w-0 rounded-media bg-bg shadow-float max-lg:max-h-[45dvh]"
                    style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
                    role="img"
                    aria-label="The cut"
                  />
                </div>
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
                <span className="tabular w-[104px] text-fg-2">
                  {formatTenths(player.time)} / {formatTenths(length)}
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
                    disabled={pxPerSec <= MIN_ZOOM}
                    onClick={() =>
                      setPxPerSec((z) => Math.max(MIN_ZOOM, z / 1.4))
                    }
                  >
                    <Minus />
                  </IconButton>
                  <IconButton
                    label="Zoom in"
                    disabled={pxPerSec >= MAX_ZOOM}
                    onClick={() =>
                      setPxPerSec((z) => Math.min(MAX_ZOOM, z * 1.4))
                    }
                  >
                    <Plus />
                  </IconButton>
                  <button
                    type="button"
                    onClick={() => setPxPerSec(fitZoom(length))}
                    className="rounded-control px-2 py-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    Fit
                  </button>
                </div>
              </div>
              {/* the timeline: wide screens; the storyboard serves phones (TICKET-066) */}
              <div ref={lane} className="hidden h-[272px] shrink-0 lg:block">
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
              {/* the phone's playhead: drag to any moment (the timeline's ruler is desktop's) */}
              <div className="flex h-9 shrink-0 items-center px-3 lg:hidden">
                <input
                  type="range"
                  name="playhead"
                  aria-label="Playhead"
                  aria-valuetext={formatTenths(player.time)}
                  min={0}
                  max={Math.max(1, length)}
                  step={1000 / (doc.fps || 24)}
                  value={Math.min(player.time, length)}
                  onChange={(e) => player.seek(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              {/* the storyboard: phones and narrow windows (§17.4) */}
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border lg:hidden",
                  TABS_ROOM
                )}
              >
                <Storyboard
                  doc={doc}
                  onChange={change}
                  labelOf={labels}
                  time={player.time}
                  onSeek={player.seek}
                  take={takeUI}
                  onUndo={undo}
                />
              </div>
            </>
          )}
        </div>

        {/* below 1024: the tabs at the foot, and the media as a sheet (§17.4) */}
        <MediaSheet
          open={mediaOpen}
          onOpenChange={setMediaOpen}
          groups={groups}
        />
        <ProjectTabs
          projectId={projectId}
          view="cut"
          below="lg"
          onMedia={() => setMediaOpen(true)}
        />
        <aside
          aria-label="Media"
          className="hidden h-dvh w-[300px] shrink-0 border-l border-border bg-bg lg:block"
        >
          <MediaTray
            groups={groups}
            marks={inCut}
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

        {/* a real dialog: focus stays in it, Esc closes (or cancels), nothing behind takes keys */}
        <Dialog
          open={Boolean(exporting)}
          onOpenChange={(open) => {
            if (!open) closeExport();
          }}
        >
          <DialogContent className="max-w-[560px]" aria-describedby={undefined}>
            <DialogTitle>Export</DialogTitle>
            {exporting && (
              <div>
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
                      Making the cut, {Math.round(exporting.progress * 100)}%
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
                    <p role="alert" className="mt-3 text-[13px] text-fg-2">
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
                          downloadFile(
                            exporting.url,
                            fileNameFrom(title, "cut")
                          )
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
                            ? "Saved to the project"
                            : exporting.kept === "keeping"
                              ? "Saving…"
                              : "Save to the project"}
                        </Button>
                      )}
                      {exporting.kept === "failed" && (
                        <span role="alert" className="text-[13px] text-fg-2">
                          It was not saved. Try again.
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
            )}
          </DialogContent>
        </Dialog>
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
      className="grid size-8 pointer-coarse:size-11 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

/** Make | Cut, in a project's header (§17.2). */
export function ProjectViews({
  projectId,
  view,
  className,
}: {
  projectId: string;
  view: "make" | "cut";
  className?: string;
}) {
  return (
    <nav
      aria-label="Project"
      className={cn(
        "inline-flex rounded-control border border-border p-0.5 text-[13px] font-medium",
        className
      )}
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
            "rounded-chip px-3 py-1 pointer-coarse:py-2.5 transition-colors",
            view === id ? "bg-surface-3 text-fg" : "text-fg-2 hover:text-fg"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
