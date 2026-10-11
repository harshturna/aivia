"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Upload } from "lucide-react";
import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader } from "@/components/shell/screen";
import { StudioActionsProvider } from "@/components/studio/actions";
import {
  acceptFiles,
  Composer,
  type ComposerMode,
} from "@/components/studio/composer";
import type { ToolPart } from "@/components/studio/outputs";
import {
  costOf,
  DEFAULT_PARAMS,
  ModeParamPills,
  type ModeParams,
} from "@/components/studio/params";
import { Run } from "@/components/studio/run";
import { Button } from "@/components/ui/button";
import { userProModal } from "@/hooks/useProModal";
import { ANIMATE_BRIEF, aspectOfSize } from "@/lib/ai/direct";
import { getLocalSession, saveLocalSession } from "@/lib/guest-local";
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

const EXAMPLES = [
  "A poster, a short teaser and a soundtrack for a forest older than memory",
  "Album art for a quiet piano record, and a name for it",
  "A snowy owl over a frozen lake at dawn, as a poster and a short clip",
  "The sound of rain on a tin roof, twenty seconds",
];

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

/** The direct mode and parameters that make one piece of a run again. */
function pieceRequest(part: ToolPart) {
  const input = (part.input ?? {}) as {
    prompt?: string;
    amount?: number;
    aspect?: string;
    seconds?: number;
  };
  const nearest = <T extends number>(options: readonly T[], value?: number) =>
    value === undefined
      ? undefined
      : options.reduce((a, b) =>
          Math.abs(b - value) < Math.abs(a - value) ? b : a
        );
  const output = part.output as { prompt?: string } | undefined;
  const prompt = output?.prompt ?? input.prompt ?? "";
  const params: Partial<ModeParams> = {};
  let mode: ComposerMode;
  switch (part.type) {
    case "tool-generate_image":
      mode = "image";
      params.count = (nearest([1, 2, 3, 4] as const, input.amount) ??
        1) as ModeParams["count"];
      if (input.aspect) params.aspect = input.aspect as ModeParams["aspect"];
      break;
    case "tool-generate_video":
      mode = "video";
      if (input.aspect)
        params.videoAspect = input.aspect as ModeParams["videoAspect"];
      break;
    case "tool-generate_music":
      mode = "music";
      params.musicSeconds = nearest([15, 30, 60] as const, input.seconds) ?? 30;
      break;
    default:
      mode = "sound";
      params.soundSeconds = nearest([0, 2, 5, 10] as const, input.seconds) ?? 0;
  }
  return { prompt, mode, params };
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
export function StudioClient({
  id,
  initialMessages = [],
  initialPrompt = "",
  initialTitle = "New session",
  initialMode = "auto",
  isNew,
  isGuest = false,
  initialAnimate,
  localId,
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
        window.history.replaceState(null, "", `/studio?local=${fork}`);
      }
      if (messages.length === 0) {
        setTitle(titleFromBrief(text));
        // A new session gets its address on the first send, so a reload resumes it. A guest's
        // run is not stored on the server (TICKET-038); it is kept in this browser and gets a
        // local address instead (TICKET-041).
        if (isNew && !isGuest) {
          window.history.replaceState(null, "", `/studio/${id}`);
          setTimeout(
            () => window.dispatchEvent(new Event(SESSIONS_CHANGED)),
            1500
          );
        } else if (isNew && isGuest)
          window.history.replaceState(null, "", `/studio?local=${id}`);
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
  const actions = useMemo(
    () => ({
      animate: busy || limit ? undefined : animate,
      cut: { canSave: !isGuest, sessionId: isGuest ? null : id },
    }),
    [animate, busy, limit, isGuest, id]
  );

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

  const reuse = useCallback((prompt: string) => {
    setInput(prompt);
    composerRef.current?.focus();
  }, []);

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
      <LazyMotion features={domMax}>
        <MotionConfig reducedMotion="user">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: the drop target is the page; the composer's button is the keyboard path */}
          <div
            className="relative flex min-h-dvh flex-col lg:min-h-dvh"
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes("Files")) return;
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              setFiles((current) =>
                acceptFiles(current, Array.from(event.dataTransfer.files))
              );
            }}
          >
            <ScreenHeader
              title={
                <EditableTitle
                  id={id}
                  title={title}
                  onChange={setTitle}
                  enabled={!empty && !isGuest}
                />
              }
            >
              {busy && (
                <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-fg-2">
                  <span className="size-1.5 animate-pulse rounded-full bg-sun" />
                  Running
                </span>
              )}
              {!empty && !busy && !isGuest && (
                <DeleteSession onConfirm={remove} />
              )}
            </ScreenHeader>

            {empty ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
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
                  <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {EXAMPLES.map((example) => (
                      <li key={example}>
                        <button
                          type="button"
                          onClick={() => {
                            setInput(example);
                            composerRef.current?.focus();
                          }}
                          className="rounded-full border border-border px-3 py-1.5 text-[12.5px] leading-[18px] text-fg-2 transition-colors duration-150 hover:border-border-strong hover:text-fg"
                        >
                          {example}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
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
                              last && !busy && !limit ? retryPiece : undefined
                            }
                          />
                        </div>
                      );
                    })}
                    {error && !limit && failure && (
                      <div className="flex items-center justify-between gap-4 rounded-media border border-border bg-surface p-4 text-[13px]">
                        <span className="text-fg-2">{failure.text}</span>
                        {failure.action === "retry" && (
                          <Button variant="secondary" size="sm" onClick={retry}>
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
                      <LimitMessage kind={limit} onUpgrade={proModal.onOpen} />
                    )}
                  </div>
                  {/* outside the list, so it adds no gap of its own */}
                  <div ref={bottomRef} className="scroll-mb-48" />
                </div>
                <div className="sticky bottom-0 z-10 bg-[linear-gradient(to_top,var(--color-bg)_55%,transparent)] px-6 pb-4 pt-10">
                  <m.div layoutId="composer" className="mx-auto max-w-[760px]">
                    {composer}
                  </m.div>
                </div>
              </>
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
      Delete this session
    </Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={() => setAsking(true)}>
      Delete
    </Button>
  );
}

function LimitMessage({
  kind,
  onUpgrade,
}: {
  kind: "free" | "demo";
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-media border border-border bg-surface p-5">
      {kind === "free" ? (
        <>
          <p className="text-[15px]">You have used your free generations.</p>
          <p className="mt-1 text-[13px] text-mute">
            Pro is unlimited, for $20 a month.
          </p>
          <Button className="mt-4" onClick={onUpgrade}>
            Upgrade to Pro
          </Button>
        </>
      ) : (
        <>
          <p className="text-[15px]">
            The guest session has reached its limit.
          </p>
          <p className="mt-1 text-[13px] text-mute">
            Create an account to keep making things.
          </p>
          <Button className="mt-4" asChild>
            <a href="/signup">Create an account</a>
          </Button>
        </>
      )}
    </div>
  );
}

/** The session title in the header; click to rename once the session exists. */
function EditableTitle({
  id,
  title,
  onChange,
  enabled,
}: {
  id: string;
  title: string;
  onChange: (t: string) => void;
  enabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === title) return;
    onChange(next);
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
        aria-label="Session name"
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
