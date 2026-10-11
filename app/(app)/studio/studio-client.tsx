"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Upload } from "lucide-react";
import { domMax, LazyMotion, m } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader } from "@/components/shell/screen";
import { StudioActionsProvider } from "@/components/studio/actions";
import {
  acceptFiles,
  Composer,
  type ComposerMode,
} from "@/components/studio/composer";
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

/** Fired when a run ends so the sidebar's recents can reload. */
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
  "A poster, a ten-second teaser and a soundtrack for a forest older than memory",
  "Album art for a quiet piano record, and a name for it",
  "A snowy owl over a frozen lake at dawn, as a poster and a short clip",
  "The sound of rain on a tin roof, twenty seconds",
];

type Limit = "free" | "demo" | null;

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
  const sentMode = useRef<ComposerMode>("auto");
  const modes = useRef<Record<string, ComposerMode>>({});
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      if (!isGuest) window.dispatchEvent(new Event(SESSIONS_CHANGED));
    },
    onError: (err) => {
      const message = err?.message ?? "";
      if (message.includes("Free trial")) setLimit("free");
      else if (message.includes("limit reached")) setLimit("demo");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;

  // Stamp each new brief with the time it was sent, for the elapsed clock.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (busy && last?.role === "user" && !started.current[last.id]) {
      started.current[last.id] = Date.now();
      modes.current[last.id] = sentMode.current;
    }
  }, [messages, busy]);

  // Follow the run as it streams.
  useEffect(() => {
    if (!empty) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status, empty]);

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
      }
    ) => {
      if (busy || limit) return;
      clearError();
      let list: FileList | undefined;
      if (attached.length) {
        const dt = new DataTransfer();
        for (const f of await Promise.all(attached.map(fitImage)))
          dt.items.add(f);
        list = dt.files;
      }
      // A still sent in Video mode is animated in its own shape (TICKET-039).
      let sent = params;
      if (extra?.aspect) sent = { ...params, aspect: extra.aspect };
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
      sentMode.current = chosen;
      sendMessage(
        {
          text,
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
        { body: { mode: chosen, params: sent, scene: extra?.scene } }
      );
      setFiles([]);
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
      id,
    ]
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
    if (!isGuest || busy || messages.length === 0) return;
    saveLocalSession({
      id,
      title,
      messages: messages as unknown as Parameters<
        typeof saveLocalSession
      >[0]["messages"],
    });
  }, [isGuest, busy, messages, title, id]);

  // From the library: animate the asset once, on arrival (TICKET-039). Scheduled and
  // cancelled on teardown, so a mount that is torn down at once (React's development double
  // mount) never sends, and only the mount that stays does.
  const animatedOnArrival = useRef(false);
  useEffect(() => {
    if (!initialAnimate || animatedOnArrival.current) return;
    const timer = window.setTimeout(() => {
      animatedOnArrival.current = true;
      animate(initialAnimate);
      // a guest's run has no address; drop the query so a reload does not spend again
      if (isGuest) window.history.replaceState(null, "", "/studio");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialAnimate, animate, isGuest]);

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
              <div className="flex-1 px-6 pb-48 pt-8">
                <div className="mx-auto max-w-[760px] space-y-10">
                  {runs.map((run, i) => {
                    const last = i === runs.length - 1;
                    return (
                      <div
                        key={run.user.id}
                        className={cn(i > 0 && "border-t border-border pt-10")}
                      >
                        <Run
                          user={run.user}
                          assistant={run.assistant}
                          active={last && busy}
                          startedAt={started.current[run.user.id]}
                          waitingLabel={
                            (modes.current[run.user.id] ?? "auto") === "auto"
                              ? "Planning…"
                              : "Generating…"
                          }
                          onReusePrompt={reuse}
                          onRetry={last ? () => regenerate() : undefined}
                        />
                      </div>
                    );
                  })}
                  {isGuest && !busy && runs.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-media border border-border bg-surface p-4 text-[13.5px]">
                      <span className="max-w-[52ch] text-fg-2">
                        This lives only in this browser. Create an account to
                        keep it, and everything you make next.
                      </span>
                      <Button asChild size="sm">
                        <Link href="/signup">Create an account</Link>
                      </Button>
                    </div>
                  )}
                  {error && !limit && (
                    <div className="flex items-center justify-between gap-4 rounded-media border border-border bg-surface p-4 text-[13px]">
                      <span className="text-fg-2">
                        The run stopped before it finished.
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => regenerate()}
                      >
                        Try again
                      </Button>
                    </div>
                  )}
                  {limit && (
                    <LimitMessage kind={limit} onUpgrade={proModal.onOpen} />
                  )}
                  <div ref={bottomRef} className="scroll-mb-48" />
                </div>
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
