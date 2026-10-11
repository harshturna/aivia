"use client";

import { isToolUIPart, type UIMessage } from "ai";
import { Check, ChevronDown, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Markdown } from "@/components/ai/Markdown";
import { useStudioActions } from "@/components/studio/actions";
import { CutAction } from "@/components/studio/cut";
import { Spinner } from "@/components/ui/spinner";
import { readPlan } from "@/lib/ai/plan";
import { canCut, collectCut } from "@/lib/cut";
import { messageText, titleFromBrief } from "@/lib/session-text";
import { cn } from "@/lib/utils";
import { ToolOutput, type ToolPart } from "./outputs";

/**
 * One run (design §5.3): the brief as a line, the plan as a compact strip of steps, the
 * outputs at full column width, then the notes. No bubbles, no avatars.
 */
export interface RunProps {
  user: UIMessage;
  assistant?: UIMessage;
  /** The chat is working on this run right now. */
  active: boolean;
  /** When this run was sent, if it was sent in this tab (for the elapsed time). */
  startedAt?: number;
  /** What the run says while it waits for its first part: a direct mode has no plan. */
  waitingLabel?: string;
  onReusePrompt?: (prompt: string) => void;
  onRetry?: () => void;
}

export function Run({
  user,
  assistant,
  active,
  startedAt,
  waitingLabel = "Planning…",
  onReusePrompt,
  onRetry,
}: RunProps) {
  const parts = assistant?.parts ?? [];
  const { cut } = useStudioActions();
  const pieces = useMemo(() => collectCut(parts as never), [parts]);
  const { steps, notes, done, failed } = readPlan(parts as never, !active);
  const tools = parts.filter((p) => isToolUIPart(p)) as ToolPart[];
  const elapsed = useElapsed(active ? startedAt : undefined);
  const [open, setOpen] = useState<boolean | null>(null);
  const stepsOpen = open ?? active;
  const thinking = active && !notes && tools.length === 0 && steps.length === 0;

  return (
    <article className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <Brief message={user} />

      <p className="sr-only" aria-live="polite">
        {active
          ? steps.length
            ? `${done} of ${steps.length} steps done`
            : "Working"
          : assistant
            ? "Done"
            : ""}
      </p>

      {thinking && (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-fg-2">
          <Spinner className="size-3" /> {waitingLabel}
          {elapsed !== null && (
            <span className="tabular text-mute">{clock(elapsed)}</span>
          )}
        </p>
      )}

      {steps.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen(!stepsOpen)}
            aria-expanded={stepsOpen}
            className="inline-flex items-center gap-2 rounded-control text-[13px] text-fg-2 transition-colors hover:text-fg"
          >
            {active ? (
              <Spinner className="size-3" />
            ) : failed ? (
              <X className="size-3.5 text-poor" />
            ) : (
              <Check className="size-3.5 text-good" />
            )}
            <span>
              {steps.length} steps
              <span className="text-mute"> · </span>
              {active
                ? `${done} done`
                : failed
                  ? "not everything worked"
                  : "done"}
            </span>
            {active && elapsed !== null && (
              <span className="tabular text-mute">{clock(elapsed)}</span>
            )}
            <ChevronDown
              className={cn(
                "size-3.5 text-mute transition-transform duration-150",
                stepsOpen && "rotate-180"
              )}
            />
          </button>
          {stepsOpen && (
            <ol className="mt-2 space-y-1 border-l border-border pl-4">
              {steps.map((step, i) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional
                  key={i}
                  className="flex items-center gap-3 text-[13px] leading-6"
                >
                  <span className="tabular w-3 text-right text-[12px] text-mute">
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1",
                      step.status === "queued" ? "text-mute" : "text-fg-2"
                    )}
                  >
                    {step.text}
                  </span>
                  <span className="shrink-0">
                    {step.status === "done" && (
                      <Check className="size-3.5 text-good" />
                    )}
                    {step.status === "running" && (
                      <Spinner className="size-3" />
                    )}
                    {step.status === "failed" && (
                      <X className="size-3.5 text-poor" />
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {tools.length > 0 && (
        <div className="mt-5 space-y-3">
          {tools.map((part) => (
            <ToolOutput
              key={part.toolCallId}
              part={part}
              onReusePrompt={onReusePrompt}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}

      {notes && (
        <div className="mt-5 max-w-[68ch] text-[15px] leading-6 text-fg [&_p:first-child]:mt-0">
          <Markdown>{notes}</Markdown>
        </div>
      )}

      {!active && cut && canCut(pieces) && (
        <CutAction
          pieces={pieces}
          title={titleFromBrief(messageText(user))}
          canSave={cut.canSave}
          sessionId={cut.sessionId}
        />
      )}
    </article>
  );
}

function Brief({ message }: { message: UIMessage }) {
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("");
  const files = message.parts.filter((p) => p.type === "file") as Array<{
    url: string;
    mediaType: string;
    filename?: string;
  }>;
  return (
    <div>
      {files.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {files.map((file, i) =>
            file.mediaType.startsWith("image/") ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: attachments are positional
              <li key={i}>
                {/* biome-ignore lint/performance/noImgElement: a data URL thumbnail */}
                <img
                  src={file.url}
                  alt={file.filename ?? "Attached image"}
                  className="size-10 rounded-control object-cover"
                />
              </li>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: attachments are positional
              <li
                key={i}
                className="inline-flex h-10 items-center gap-2 rounded-control border border-border px-3 text-[12px] text-fg-2"
              >
                <FileText className="size-4" />
                <span className="max-w-[180px] truncate">
                  {file.filename ?? "Document"}
                </span>
              </li>
            )
          )}
        </ul>
      )}
      <p className="whitespace-pre-wrap text-[15px] leading-6 text-fg-2">
        {text}
      </p>
    </div>
  );
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Whole seconds since `start`, ticking; null when there is no start. */
function useElapsed(start?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (start === undefined) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [start]);
  if (start === undefined) return null;
  return Math.max(0, Math.floor((now - start) / 1000));
}
