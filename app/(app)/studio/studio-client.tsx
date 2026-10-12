"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { PanelRight, Upload } from "lucide-react";
import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type MediaHandlers,
  MediaHandlersProvider,
  type MediaIndex,
  MediaIndexProvider,
} from "@/components/media/actions";
import { MEDIA_DRAG, MediaTray } from "@/components/media/tray";
import { ScreenHeader } from "@/components/shell/screen";
import { StudioActionsProvider } from "@/components/studio/actions";
import {
  acceptFiles,
  Composer,
  type ComposerMode,
} from "@/components/studio/composer";
import { LimitMessage } from "@/components/studio/limit-message";
import { measure } from "@/components/studio/measure";
import type { ToolPart } from "@/components/studio/outputs";
import {
  costOf,
  DEFAULT_PARAMS,
  ModeParamPills,
  type ModeParams,
} from "@/components/studio/params";
import { pieceRequest, takeFor } from "@/components/studio/piece-request";
import {
  type ProjectCardData,
  ProjectGrid,
} from "@/components/studio/project-grid";
import { Run } from "@/components/studio/run";
import { ProjectViews, queueForCut } from "@/components/timeline/cut-view";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { userProModal } from "@/hooks/useProModal";
import { ANIMATE_BRIEF, aspectOfSize } from "@/lib/ai/direct";
import {
  deleteLocalSession,
  getLocalSession,
  saveLocalSession,
} from "@/lib/guest-local";
import {
  fileFromUrl,
  frameOf,
  type MediaItem,
  mediaByBrief,
  nameFrom,
  withVersions,
} from "@/lib/media";
import { messageText, titleFromBrief } from "@/lib/session-text";
import { cn } from "@/lib/utils";

/** A message without pasted (data URL) attachments; real addresses stay. */
function withoutPastedFiles(message: UIMessage): UIMessage {
  return {
    ...message,
    parts: message.parts.filter(
      (p) => !(p.type === "file" && p.url.startsWith("data:"))
    ),
  };
}

/**
 * A photo is sent at most 1600 px on its long edge, as JPEG, so a phone picture stays a few
 * hundred kilobytes instead of megabytes (TICKET-042). Other files pass as they are.
 */
async function fitImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.86)
    );
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

type Aspect = ModeParams["aspect"];

export const SESSIONS_CHANGED = "aivia:sessions-changed";

/**
 * Starting points for each mode (TICKET-052): what that mode makes, and none of them a
 * pinned example a guest can already open from the sidebar.
 */
const EXAMPLES: Record<ComposerMode, string[]> = {
  auto: [
    "A poster, a short teaser and a soundtrack for a night market in the rain",
    "Album art for a quiet piano record, and a name for it",
    "A logo for a small bakery called Ember, and three taglines",
    "A lighthouse in a storm, as a poster and a short clip",
  ],
  image: [
    "A ceramic teapot on linen, soft morning light",
    "A city of paper lanterns at dusk, wide",
    "A fox in a wool scarf, painted in oils",
  ],
  video: [
    "Slow push-in on a candle flame in the dark",
    "Waves rolling onto black sand at dusk",
    "Steam rising from a cup of coffee, close up",
  ],
  music: [
    "Warm lo-fi beat with soft piano, for studying",
    "Bright synth-pop intro, short and upbeat",
    "Slow cello over rain, melancholic",
  ],
  sound: [
    "Rain on a tin roof",
    "A wooden door creaking open",
    "Footsteps on fresh snow",
  ],
};

type Limit = "free" | "demo" | null;

/** What went wrong with a run, in plain words, and the one thing to do about it (TICKET-051). */
function describeFailure(error: Error, started: boolean) {
  const message = error.message ?? "";
  if (message.includes("too long"))
    return {
      text: "The brief is too long. Shorten it and send again.",
      action: null,
    };
  if (message === "Unauthorized")
    return {
      text: "You were signed out. Reload the page to keep going.",
      action: "reload" as const,
    };
  if (/failed to fetch|networkerror|load failed|network/i.test(message))
    return {
      text: "The connection dropped. Check it and try again.",
      action: "retry" as const,
    };
  return {
    text: started
      ? "The run stopped before it finished."
      : "The run did not start. Try again.",
    action: "retry" as const,
  };
}

/**
 * What a brief was sent with, kept on the message itself, so Retry repeats the same request
 * (an Image or Animate run is not retried by the agent) even after a reload (TICKET-043).
 */
type Sent = { mode: ComposerMode; params?: ModeParams; scene?: string };
function sentWith(message: UIMessage): Sent {
  const meta = message.metadata as Partial<Sent> | undefined;
  return meta?.mode ? (meta as Sent) : { mode: "auto" };
}

/**
 * The Studio (design §5): a new session's empty state, then every exchange as a run, the
 * composer floating at the foot. The chat id is the session id; the agent route saves it.
 */
const NO_VERSIONS: MediaItem[] = [];

export function StudioClient({
  id,
  initialMessages = [],
  initialPrompt = "",
  initialTitle = "New project",
  initialMode = "auto",
  isNew,
  isGuest = false,
  initialAnimate,
  localId,
  sendOnArrival = false,
  projects = [],
  trayOpen: initialTray = true,
  initialRef,
  versions = NO_VERSIONS,
}: {
  id: string;
  initialMessages?: UIMessage[];
  initialPrompt?: string;
  initialTitle?: string;
  initialMode?: ComposerMode;
  isNew: boolean;
  /** The shared guest account: its runs are not stored, its examples are not editable. */
  isGuest?: boolean;
  /** A still from the library to animate as soon as the Studio opens. */
  initialAnimate?: {
    url: string;
    prompt: string;
    width: number;
    height: number;
  };
  /** A guest session kept in this browser, to reopen (TICKET-041). */
  localId?: string;
  /** The landing's composer was sent: send its prompt once, on arrival (TICKET-055). */
  sendOnArrival?: boolean;
  /** Home's projects, shown under its composer (TICKET-062). */
  projects?: ProjectCardData[];
  /** The media tray's last state, from its cookie (TICKET-063). */
  trayOpen?: boolean;
  /** A piece from the library to attach as the brief's reference, on arrival. */
  initialRef?: { url: string; prompt: string };
  /** The project's edited images and kept cuts, on top of the tray (TICKET-067). */
  versions?: MediaItem[];
}) {
  const router = useRouter();
  const proModal = userProModal();
  const [input, setInput] = useState(initialPrompt);
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<ComposerMode>(initialMode);
  const [params, setParams] = useState<ModeParams>(DEFAULT_PARAMS);
  const [limit, setLimit] = useState<Limit>(null);
  const [title, setTitle] = useState(initialTitle);
  const [dragging, setDragging] = useState(false);
  const started = useRef<Record<string, number>>({});
  // A guest's session is kept in this browser under this id once they send something; an
  // example they open is forked to a fresh id, so the example itself is never saved and a
  // reload brings back their own run (TICKET-043).
  const [localKey, setLocalKey] = useState<string | null>(
    isGuest ? (localId ?? (isNew ? id : null)) : null
  );
  const touched = useRef(false);
  // a send whose image work is still under way: `busy` only turns true once it is sent, and
  // a second click in between would pay twice (TICKET-046)
  const inFlight = useRef(false);
  // the address and local copy before a send that gave this session its address; a refusal
  // of that send puts them back (a later refusal leaves a real session where it is)
  const revert = useRef<{ address: string; localKey: string | null } | null>(
    null
  );
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  // the reader is at the foot of the thread, so it follows the run as it grows (TICKET-051)
  const follow = useRef(false);
  const finishedAt = useRef(0);
  // a saved session opens at its last run, once
  const opened = useRef(false);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    clearError,
  } = useChat({
    id,
    messages: initialMessages,
    // Auto goes to the agent; a direct mode goes straight to its capability.
    transport: new DefaultChatTransport({
      api: "/api/agent",
      prepareSendMessagesRequest: ({ id: chatId, messages: all, body }) => ({
        api:
          body?.mode && body.mode !== "auto" ? "/api/generate" : "/api/agent",
        // pasted attachments travel once: earlier messages go without their data URLs, so
        // one large photo cannot push every later request past the platform limit
        body: {
          ...body,
          id: chatId,
          messages: all.map((m, i) =>
            i === all.length - 1 ? m : withoutPastedFiles(m)
          ),
        },
      }),
    }),
    onFinish: () => {
      finishedAt.current = Date.now();
      if (!isGuest) window.dispatchEvent(new Event(SESSIONS_CHANGED));
    },
    onError: (err) => {
      const message = err?.message ?? "";
      // a refused first send made nothing: its address would not reopen, its brief is not kept
      const undoAddress = () => {
        const before = revert.current;
        if (!before) return;
        window.history.replaceState(null, "", before.address);
        touched.current = false;
        setLocalKey(before.localKey);
        setTitle(initialTitle);
      };
      // too long: the brief goes back in the composer to shorten, not left as a dead run
      if (message.includes("too long")) {
        setMessages((all) => {
          const last = all[all.length - 1];
          if (last?.role !== "user") return all;
          setInput(messageText(last));
          return all.slice(0, -1);
        });
        undoAddress();
        return;
      }
      const refused = message.includes("Free trial")
        ? "free"
        : message.includes("limit reached")
          ? "demo"
          : null;
      if (!refused) return;
      setLimit(refused);
      undoAddress();
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;

  // Stamp each new brief with the time it was sent, for the elapsed clock.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (busy && last?.role === "user" && !started.current[last.id])
      started.current[last.id] = Date.now();
  }, [messages, busy]);

  // Follow the run while it grows, only when the reader is at the foot: someone who scrolled
  // up to look at something stays there (TICKET-051).
  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      follow.current =
        root.scrollHeight - window.scrollY - window.innerHeight < 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toFoot = useCallback(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: follows every change to the run
  useEffect(() => {
    if (busy && follow.current) toFoot();
  }, [messages, status, busy, toFoot]);
  // media that loads after its part arrives grows the thread too; follow it while the run is
  // going or has just finished
  // biome-ignore lint/correctness/useExhaustiveDependencies: `empty` re-attaches once the thread mounts
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    const observer = new ResizeObserver(() => {
      const recent = Date.now() - finishedAt.current < 15_000;
      if (follow.current && (busy || recent)) toFoot();
    });
    observer.observe(thread);
    return () => observer.disconnect();
  }, [busy, toFoot, empty]);
  // A saved session opens at the start of its last run, not at the foot of its last clip.
  useEffect(() => {
    if (opened.current || busy || messages.length === 0) return;
    opened.current = true;
    const all = document.querySelectorAll("[data-run]");
    if (all.length > 1) all[all.length - 1]?.scrollIntoView({ block: "start" });
  }, [messages.length, busy]);

  // Esc stops a run from anywhere, unless it is closing a dialog or a menu (design §4).
  useEffect(() => {
    if (!busy) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"], [role="menu"]')) return;
      stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, stop]);

  // `/` focuses the composer from anywhere that is not a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const t = event.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable=true]")) return;
      event.preventDefault();
      composerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runs = useMemo(() => {
    const out: Array<{ user: UIMessage; assistant?: UIMessage }> = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role !== "user") continue;
      const next = messages[i + 1];
      out.push({
        user: msg,
        assistant: next?.role === "assistant" ? next : undefined,
      });
    }
    return out;
  }, [messages]);

  const lastBrief = useMemo(() => {
    const users = messages.filter((x) => x.role === "user");
    return users.length ? messageText(users[users.length - 1]) : undefined;
  }, [messages]);

  const send = useCallback(
    async (
      text: string,
      chosen: ComposerMode,
      attached: File[],
      extra?: {
        still?: { url: string; mediaType: string };
        aspect?: Aspect;
        scene?: string;
        /** A piece made again carries its own parameters (TICKET-051). */
        params?: Partial<ModeParams>;
        /** New take (TICKET-068): a fork from an example keeps the example's name. */
        take?: boolean;
      }
    ) => {
      if (busy || limit || inFlight.current) return;
      inFlight.current = true;
      opened.current = true;
      follow.current = true;
      clearError();
      let list: FileList | undefined;
      if (attached.length) {
        const dt = new DataTransfer();
        for (const f of await Promise.all(attached.map(fitImage)))
          dt.items.add(f);
        list = dt.files;
      }
      // A still sent in Video mode is animated in its own shape (TICKET-039).
      let sent = { ...params, ...extra?.params };
      if (extra?.aspect) sent = { ...sent, aspect: extra.aspect };
      else if (chosen === "video") {
        const image = attached.find((f) => f.type.startsWith("image/"));
        if (image)
          try {
            const bitmap = await createImageBitmap(image);
            sent = {
              ...params,
              aspect: aspectOfSize(bitmap.width, bitmap.height),
            };
            bitmap.close();
          } catch {}
      }
      touched.current = true;
      const gainsAddress =
        (isNew && messages.length === 0) || (isGuest && !localKey);
      revert.current = gainsAddress
        ? {
            address: window.location.pathname + window.location.search,
            localKey,
          }
        : null;
      const sentAs: Sent = { mode: chosen, params: sent, scene: extra?.scene };
      void sendMessage(
        {
          text,
          metadata: sentAs,
          files: extra?.still
            ? [
                {
                  type: "file",
                  mediaType: extra.still.mediaType,
                  url: extra.still.url,
                },
              ]
            : list,
        },
        { body: sentAs }
      ).finally(() => {
        inFlight.current = false;
      });
      // an Animate carries its own still; what is attached waits for the next brief
      if (!extra?.still) setFiles([]);
      // a guest who adds to an example keeps their own copy under a new id
      if (isGuest && !localKey) {
        const fork = crypto.randomUUID();
        setLocalKey(fork);
        window.history.replaceState(null, "", `/p/${fork}`);
        // named after what they asked, so it is not a second "Owl over a frozen lake";
        // a take asked for no new subject, so the copy keeps the example's name
        if (messages.length > 0)
          setTitle(extra?.take ? `${title} (your copy)` : titleFromBrief(text));
      }
      if (messages.length === 0) {
        setTitle(titleFromBrief(text));
        // A new session gets its address on the first send, so a reload resumes it. A guest's
        // run is not stored on the server (TICKET-038); it is kept in this browser and gets a
        // local address instead (TICKET-041).
        if (isNew && !isGuest) {
          window.history.replaceState(null, "", `/p/${id}`);
          setTimeout(
            () => window.dispatchEvent(new Event(SESSIONS_CHANGED)),
            1500
          );
        } else if (isNew && isGuest)
          window.history.replaceState(null, "", `/p/${id}`);
      }
    },
    [
      busy,
      limit,
      clearError,
      sendMessage,
      params,
      messages.length,
      isNew,
      isGuest,
      localKey,
      id,
      title,
    ]
  );

  // Retry repeats the last brief exactly as it was sent: same mode, same parameters.
  const retry = useCallback(() => {
    const users = messages.filter((x) => x.role === "user");
    const last = users[users.length - 1];
    if (!last || busy) return;
    touched.current = true;
    clearError();
    follow.current = true;
    void regenerate({ body: sentWith(last) });
  }, [messages, busy, clearError, regenerate]);

  // One piece of a run made again, as a run of its own, in its direct mode: the pieces that
  // worked stay where they are (TICKET-051).
  const retryPiece = useCallback(
    (part: ToolPart) => {
      const {
        prompt,
        mode: pieceMode,
        params: pieceParams,
      } = pieceRequest(part);
      if (!prompt) return;
      void send(prompt, pieceMode, [], { params: pieceParams });
    },
    [send]
  );

  // Animate a still: a Video request carrying the image, in the image's own shape.
  const animate = useCallback(
    (still: { url: string; prompt: string; width: number; height: number }) => {
      const ext = still.url.split("?")[0].split(".").pop()?.toLowerCase();
      const mediaType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";
      void send(ANIMATE_BRIEF, "video", [], {
        still: { url: still.url, mediaType },
        aspect: aspectOfSize(still.width, still.height),
        scene: still.prompt,
      });
    },
    [send]
  );
  const actions = useMemo(() => ({ cut: { projectId: id } }), [id]);

  // A guest's session lives in this browser (TICKET-041): reopened on arrival, kept as
  // each run finishes.
  useEffect(() => {
    if (!isGuest || !localId) return;
    const local = getLocalSession(localId);
    if (!local) return;
    setMessages(local.messages as unknown as UIMessage[]);
    setTitle(local.title);
  }, [isGuest, localId, setMessages]);
  useEffect(() => {
    if (!localKey || !touched.current || busy || messages.length === 0) return;
    saveLocalSession({
      id: localKey,
      title,
      messages: messages as unknown as Parameters<
        typeof saveLocalSession
      >[0]["messages"],
    });
  }, [localKey, busy, messages, title]);

  // From the library: animate the asset once, on arrival (TICKET-039). Scheduled and
  // cancelled on teardown, so a mount that is torn down at once (React's development double
  // mount) never sends, and only the mount that stays does.
  const animatedOnArrival = useRef(false);
  useEffect(() => {
    if (!initialAnimate || animatedOnArrival.current) return;
    const timer = window.setTimeout(() => {
      animatedOnArrival.current = true;
      animate(initialAnimate);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialAnimate, animate]);

  // The landing's send, carried here: sent once, the same way, through the same guard. The
  // address drops the prompt first, so a reload or Back does not send it again.
  const sentOnArrival = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, on arrival
  useEffect(() => {
    if (!sendOnArrival || sentOnArrival.current) return;
    const timer = window.setTimeout(() => {
      sentOnArrival.current = true;
      window.history.replaceState(null, "", "/studio");
      void send(initialPrompt.trim(), initialMode, []);
      setInput("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // ── the project's media (D-005 §17.2, TICKET-063) ──────────────────────────────────
  const [tray, setTray] = useState(initialTray);
  const [traySheet, setTraySheet] = useState(false);
  const groups = useMemo(
    () =>
      withVersions(
        versions,
        mediaByBrief(messages as unknown as Parameters<typeof mediaByBrief>[0])
      ),
    [messages, versions]
  );
  const toggleTray = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches)
      setTray((open) => {
        const next = !open;
        document.cookie = `aivia_tray=${next ? "open" : "closed"}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        return next;
      });
    else setTraySheet(true);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ".") {
        event.preventDefault();
        toggleTray();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTray]);

  // a saved project's pieces are library assets: found by address, for favourites and Edit
  const [index, setIndex] = useState<MediaIndex>(new Map());
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshed as runs finish
  useEffect(() => {
    if (localKey || empty || busy) return;
    let cancelled = false;
    fetch(`/api/assets?project=${id}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then(
        (page: {
          items: Array<{ id: string; url: string; favorite: boolean }>;
        }) => {
          if (cancelled) return;
          setIndex(
            new Map(
              page.items.map((a) => [a.url, { id: a.id, favorite: a.favorite }])
            )
          );
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, localKey, empty, busy, messages.length]);

  const attach = useCallback((file: File) => {
    setFiles((current) => acceptFiles(current, [file]));
    composerRef.current?.focus();
  }, []);

  const handlers = useMemo<MediaHandlers>(
    () => ({
      open: (item) => window.open(item.url, "_blank", "noopener,noreferrer"),
      // the editor opens in the project, on the piece (TICKET-067)
      edit: (item) =>
        router.push(
          `/p/${item.projectId ?? id}/edit?src=${encodeURIComponent(item.assetId ?? item.url)}`
        ),
      animate:
        busy || limit
          ? undefined
          : (item) => {
              const img = document.querySelector<HTMLImageElement>(
                `img[src="${CSS.escape(item.url)}"]`
              );
              animate({
                url: item.url,
                prompt: item.prompt,
                width: img?.naturalWidth || 1,
                height: img?.naturalHeight || 1,
              });
            },
      attachToBrief: (item) => {
        void fileFromUrl(item.url, nameFrom(item.prompt, "reference"))
          .then(attach)
          .catch(() => {});
      },
      frameToBrief: (item, video) => {
        const el =
          video ??
          document.querySelector<HTMLVideoElement>(
            `video[data-media-url="${CSS.escape(item.url)}"]`
          );
        if (!el) return;
        void frameOf(el, nameFrom(item.prompt, "frame"))
          .then(attach)
          .catch(() => {});
      },
      reusePrompt: (item) => {
        setInput(item.prompt);
        composerRef.current?.focus();
      },
      // the piece made again, one of it, as a run of its own (TICKET-068)
      newTake:
        busy || limit
          ? undefined
          : (item) => {
              void (async () => {
                // the piece's own shape, read from its file, for a run that named none
                const size = await measure(
                  item.url,
                  item.kind === "video" ? "video" : "image"
                );
                const request = takeFor(
                  messages as unknown as Parameters<typeof takeFor>[0],
                  item.url,
                  size
                );
                if (!request) return;
                const still = request.files[0];
                void send(request.prompt, request.mode, [], {
                  params: request.params,
                  scene: request.scene,
                  ...(still
                    ? { still: { url: still.url, mediaType: still.mediaType } }
                    : {}),
                  // a take on an example makes the guest's own copy: named for the example
                  take: true,
                });
              })();
            },
      canTake: (item) =>
        takeFor(
          messages as unknown as Parameters<typeof takeFor>[0],
          item.url
        ) !== null,
      // the piece waits for the Cut view, which adds it as it opens (TICKET-065)
      addToCut: (item) => {
        queueForCut(id, item);
        router.push(`/p/${id}/cut`);
      },
      favourite: isGuest
        ? undefined
        : (item) => {
            if (!item.assetId) return;
            const next = !item.favorite;
            setIndex((m) =>
              new Map(m).set(item.url, {
                id: item.assetId as string,
                favorite: next,
              })
            );
            void fetch(`/api/assets/${item.assetId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ favorite: next }),
            });
          },
    }),
    [router, busy, limit, animate, attach, isGuest, id, messages, send]
  );

  /** Shows a piece where it was made: the thread scrolls to it and marks it briefly. */
  const openInThread = useCallback(
    (item: MediaItem) => {
      setTraySheet(false);
      const el =
        document.querySelector<HTMLElement>(
          `[data-media-url="${CSS.escape(item.url)}"]`
        ) ??
        document.querySelector<HTMLElement>(
          `img[src="${CSS.escape(item.url)}"]`
        );
      // a version is not in the thread: an image opens in the editor, a cut plays
      if (!el) {
        if (item.kind === "image" && item.assetId)
          router.push(`/p/${id}/edit?src=${item.assetId}`);
        else window.open(item.url, "_blank", "noopener,noreferrer");
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.animate(
        [
          { outline: "2px solid var(--color-fg)", outlineOffset: "4px" },
          { outline: "2px solid transparent", outlineOffset: "4px" },
        ],
        { duration: 1400, easing: "ease-out" }
      );
    },
    [router, id]
  );

  // a piece from the library, attached as the reference for the first brief
  const refAttached = useRef(false);
  useEffect(() => {
    if (!initialRef || refAttached.current) return;
    refAttached.current = true;
    void fileFromUrl(initialRef.url, nameFrom(initialRef.prompt, "reference"))
      .then(attach)
      .catch(() => {});
  }, [initialRef, attach]);

  const reuse = useCallback((prompt: string) => {
    setInput(prompt);
    composerRef.current?.focus();
  }, []);

  // a guest's own session lives in this browser: rename and delete it there (TICKET-052)
  const removeLocal = () => {
    if (localKey) deleteLocalSession(localKey);
    router.push("/studio");
  };
  const renameLocal = (next: string) => {
    touched.current = true;
    setTitle(next);
  };

  const remove = async () => {
    const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (response.ok || response.status === 404) {
      window.dispatchEvent(new Event(SESSIONS_CHANGED));
      router.push("/studio");
    }
  };

  const lastRun = runs[runs.length - 1];
  const failure = error
    ? describeFailure(error, Boolean(lastRun?.assistant?.parts.length))
    : null;

  const composer = (
    <Composer
      inputRef={composerRef}
      mode={mode}
      onModeChange={setMode}
      value={input}
      onChange={setInput}
      onSubmit={send}
      onStop={stop}
      busy={busy}
      disabled={limit !== null}
      placeholder={
        limit === "free"
          ? "You have used your free generations."
          : limit === "demo"
            ? "The guest session has reached its limit."
            : undefined
      }
      files={files}
      onFilesChange={setFiles}
      params={
        <ModeParamPills mode={mode} params={params} onChange={setParams} />
      }
      cost={costOf(mode, params)}
      lastBrief={lastBrief}
      autoFocus={empty}
    />
  );

  return (
    <StudioActionsProvider value={actions}>
      <MediaHandlersProvider value={handlers}>
        <MediaIndexProvider value={index}>
          <LazyMotion features={domMax}>
            <MotionConfig reducedMotion="user">
              {/* biome-ignore lint/a11y/noStaticElementInteractions: the drop target is the page; the composer's button is the keyboard path */}
              <div
                className="relative flex min-h-dvh"
                onDragOver={(event) => {
                  const types = event.dataTransfer.types;
                  if (!types.includes("Files") && !types.includes(MEDIA_DRAG))
                    return;
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget === event.target) setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  // a piece dragged from the tray comes as a reference (TICKET-063)
                  const piece = event.dataTransfer.getData(MEDIA_DRAG);
                  if (piece) {
                    try {
                      const item = JSON.parse(piece) as MediaItem;
                      if (item.kind === "image") handlers.attachToBrief?.(item);
                    } catch {}
                    return;
                  }
                  setFiles((current) =>
                    acceptFiles(current, Array.from(event.dataTransfer.files))
                  );
                }}
              >
                <div className="relative flex min-w-0 flex-1 flex-col">
                  <ScreenHeader
                    title={
                      <EditableTitle
                        id={id}
                        // Home until the first brief makes it a project (TICKET-062)
                        title={isNew && empty ? "Home" : title}
                        onChange={isGuest ? renameLocal : setTitle}
                        enabled={!empty && (!isGuest || localKey !== null)}
                        local={isGuest}
                      />
                    }
                  >
                    {busy && (
                      <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-fg-2">
                        <span className="size-1.5 animate-pulse rounded-full bg-sun" />
                        Running
                      </span>
                    )}
                    {!empty && <ProjectViews projectId={id} view="make" />}
                    {/* the project's media: the tray at 1024 and up, a sheet below (TICKET-063) */}
                    {!empty && (
                      <button
                        type="button"
                        onClick={toggleTray}
                        aria-label={tray ? "Hide the media" : "Show the media"}
                        aria-keyshortcuts="Meta+."
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-control px-2 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg",
                          tray && "lg:hidden"
                        )}
                      >
                        <PanelRight className="size-4" /> Media
                      </button>
                    )}
                    {!empty && !busy && (!isGuest || localKey !== null) && (
                      <DeleteSession
                        onConfirm={isGuest ? removeLocal : remove}
                      />
                    )}
                  </ScreenHeader>

                  {empty ? (
                    // a fixed top, so the heading stays put as the composer grows (TICKET-052)
                    <div className="flex flex-1 flex-col items-center px-6 pb-24 pt-[max(48px,calc(34dvh-160px))] max-sm:pt-[8dvh]">
                      <div className="w-full max-w-[720px]">
                        <h2 className="text-center font-display text-[clamp(36px,4vw,54px)] font-medium leading-[1.04] tracking-[-0.01em]">
                          What are we making?
                        </h2>
                        <m.div layoutId="composer" className="mt-8">
                          {composer}
                        </m.div>
                        {/* a brief sent back to shorten lands here, with the reason (TICKET-051) */}
                        {failure && !limit && (
                          <p
                            role="alert"
                            className="mt-3 text-center text-[13px] text-fg-2"
                          >
                            {failure.text}
                          </p>
                        )}
                        <ul className="mt-4 flex flex-wrap justify-center gap-2 max-sm:flex-col max-sm:items-stretch">
                          {EXAMPLES[mode].map((example) => (
                            <li key={example}>
                              <button
                                type="button"
                                onClick={() => {
                                  setInput(example);
                                  composerRef.current?.focus();
                                }}
                                className="rounded-full border border-border px-3 py-1.5 text-[12.5px] leading-[18px] text-fg-2 transition-colors duration-150 hover:border-border-strong hover:text-fg max-sm:w-full max-sm:rounded-control max-sm:px-3 max-sm:py-2.5 max-sm:text-left"
                              >
                                {example}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Home: the projects, wider than the composer's column (TICKET-062) */}
                      {isNew && (
                        <div className="w-full max-w-[1040px]">
                          <ProjectGrid projects={projects} isGuest={isGuest} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div ref={threadRef} className="flex-1 px-6 pb-6 pt-8">
                        <div className="mx-auto max-w-[760px] space-y-10">
                          {runs.map((run, i) => {
                            const last = i === runs.length - 1;
                            return (
                              <div
                                key={run.user.id}
                                data-run
                                className={cn(
                                  "scroll-mt-20",
                                  i > 0 && "border-t border-border pt-10"
                                )}
                              >
                                <Run
                                  user={run.user}
                                  assistant={run.assistant}
                                  active={last && busy}
                                  startedAt={started.current[run.user.id]}
                                  waitingLabel={
                                    sentWith(run.user).mode === "auto"
                                      ? "Planning…"
                                      : "Generating…"
                                  }
                                  onReusePrompt={reuse}
                                  onRetry={last && !busy ? retry : undefined}
                                  onRetryPiece={
                                    last && !busy && !limit
                                      ? retryPiece
                                      : undefined
                                  }
                                />
                              </div>
                            );
                          })}
                          {error && !limit && failure && (
                            <div className="flex items-center justify-between gap-4 rounded-media border border-border bg-surface p-4 text-[13px]">
                              <span className="text-fg-2">{failure.text}</span>
                              {failure.action === "retry" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={retry}
                                >
                                  Try again
                                </Button>
                              )}
                              {failure.action === "reload" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => window.location.reload()}
                                >
                                  Reload
                                </Button>
                              )}
                            </div>
                          )}
                          {limit && (
                            <LimitMessage
                              kind={limit}
                              onUpgrade={proModal.onOpen}
                            />
                          )}
                        </div>
                        {/* outside the list, so it adds no gap of its own */}
                        <div ref={bottomRef} className="scroll-mb-48" />
                      </div>
                      <div className="pointer-events-none sticky bottom-0 z-10 bg-[linear-gradient(to_top,var(--color-bg)_calc(100%-2.5rem),transparent)] px-6 pb-4 pt-10 [&>*]:pointer-events-auto">
                        <m.div
                          layoutId="composer"
                          className="mx-auto max-w-[760px]"
                        >
                          {composer}
                        </m.div>
                      </div>
                    </>
                  )}
                </div>
                {!empty && tray && (
                  <aside
                    aria-label="Media"
                    className="sticky top-0 hidden h-dvh w-[300px] shrink-0 border-l border-border bg-bg lg:block"
                  >
                    <MediaTray
                      groups={groups}
                      onOpen={openInThread}
                      onClose={toggleTray}
                      libraryHref={
                        localKey === null ? `/library?project=${id}` : null
                      }
                    />
                  </aside>
                )}
                {!empty && (
                  <Sheet open={traySheet} onOpenChange={setTraySheet}>
                    <SheetContent
                      side="right"
                      className="w-[min(340px,92vw)] p-0"
                    >
                      <SheetTitle className="sr-only">Media</SheetTitle>
                      <MediaTray
                        groups={groups}
                        onOpen={openInThread}
                        libraryHref={
                          localKey === null ? `/library?project=${id}` : null
                        }
                      />
                    </SheetContent>
                  </Sheet>
                )}
                {dragging && (
                  <div className="pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-window border border-dashed border-border-strong bg-bg/80 backdrop-blur-sm">
                    <p className="flex items-center gap-2 text-[14px] text-fg-2">
                      <Upload className="size-4" /> Drop images or a document to
                      attach
                    </p>
                  </div>
                )}
              </div>
            </MotionConfig>
          </LazyMotion>
        </MediaIndexProvider>
      </MediaHandlersProvider>
    </StudioActionsProvider>
  );
}

/** Delete asks once more before it acts: a session cannot be brought back. */
function DeleteSession({ onConfirm }: { onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const id = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(id);
  }, [asking]);
  return asking ? (
    <Button variant="destructive" size="sm" onClick={onConfirm} autoFocus>
      Delete this project
    </Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={() => setAsking(true)}>
      Delete
    </Button>
  );
}

/** The session title in the header; click to rename once the session exists. */
function EditableTitle({
  id,
  title,
  onChange,
  enabled,
  local = false,
}: {
  id: string;
  title: string;
  onChange: (t: string) => void;
  enabled: boolean;
  /** Kept in this browser: the new name is saved there, not sent. */
  local?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === title) return;
    onChange(next);
    if (local) return;
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next }),
    });
    window.dispatchEvent(new Event(SESSIONS_CHANGED));
  };

  if (!enabled) return <span>{title}</span>;
  if (editing) {
    return (
      <input
        // biome-ignore lint/a11y/noAutofocus: entering rename mode is the user's action
        autoFocus
        aria-label="Project name"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(title);
            setEditing(false);
          }
        }}
        className="w-[min(480px,60vw)] rounded-control bg-surface px-2 py-0.5 text-[15px] font-medium outline-none ring-1 ring-border-strong"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        setDraft(title);
        setEditing(true);
      }}
      title="Rename"
      className="max-w-[60vw] truncate rounded-control px-1 -mx-1 text-left transition-colors hover:bg-surface-2"
    >
      {title}
    </button>
  );
}
