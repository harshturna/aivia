"use client";

import { Check, Download, Film, Scissors } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { CutPieces } from "@/lib/cut";
import { cn } from "@/lib/utils";
import type { Rendered } from "./cut-render";

/**
 * "Cut it together" (TICKET-040): a finished run's clip, poster, score and lines as one piece,
 * drawn and encoded in the browser. The lanes say what goes in; render, watch, download, and
 * keep it in the library when signed in.
 */
export function CutAction({
  pieces,
  title,
  canSave,
  sessionId,
}: {
  pieces: CutPieces;
  title: string;
  canSave: boolean;
  sessionId: string | null;
}) {
  const [open, setOpen] = useState(false);
  // a finished cut outlives the dialog: closing it and opening it again shows the same cut,
  // not the lanes and "Cut it" (TICKET-053)
  const [kept, setKept] = useState<Done | null>(null);
  const keptUrl = kept?.url;
  useEffect(
    () => () => {
      if (keptUrl) URL.revokeObjectURL(keptUrl);
    },
    [keptUrl]
  );
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="mt-5"
        onClick={() => setOpen(true)}
      >
        <Scissors /> Cut it together
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-32px)] max-w-[680px]">
          <CutBody
            pieces={pieces}
            title={title}
            canSave={canSave}
            sessionId={sessionId}
            kept={kept}
            onDone={setKept}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** What the library route accepts: set under Vercel's 4.5 MB limit (TICKET-042); the site runs on Railway now and the cap stays, keeping uploads small. */
const KEEP_BYTES = 4 * 1024 * 1024;

type Done = { at: "done"; result: Rendered; url: string };
type State =
  | { at: "ready" }
  | { at: "rendering"; progress: number }
  | Done
  | { at: "failed"; message: string };

function CutBody({
  pieces,
  title,
  canSave,
  sessionId,
  kept,
  onDone,
}: {
  pieces: CutPieces;
  title: string;
  canSave: boolean;
  sessionId: string | null;
  kept: Done | null;
  onDone: (done: Done) => void;
}) {
  const [state, setState] = useState<State>(kept ?? { at: "ready" });
  const [saved, setSaved] = useState<"no" | "saving" | "yes" | "failed">("no");
  // closing the dialog stops a cut in progress (TICKET-043)
  const running = useRef<AbortController | null>(null);
  useEffect(() => () => running.current?.abort(), []);

  const lanes = useMemo(
    () =>
      [
        pieces.lines[0] && ["Title", `“${pieces.lines[0]}”`],
        pieces.clips.length > 0 && [
          "Clip",
          pieces.clips.length === 1
            ? "The teaser"
            : `${pieces.clips.length} clips, back to back`,
        ],
        pieces.stills.length > 0 && [
          pieces.clips.length ? "End card" : "Stills",
          pieces.clips.length
            ? `The poster${pieces.lines[1] ? `, “${pieces.lines[1]}”` : ""}`
            : `${Math.min(pieces.stills.length, 6)} stills, slowly moving`,
        ],
        pieces.track && [
          pieces.track.kind === "music" ? "Score" : "Sound",
          "Underneath, fitted to the cut",
        ],
      ].filter(Boolean) as Array<[string, string]>,
    [pieces]
  );

  const render = async () => {
    if (running.current) return;
    const controller = new AbortController();
    running.current = controller;
    setSaved("no");
    setState({ at: "rendering", progress: 0 });
    try {
      const { renderCut } = await import("./cut-render");
      const result = await renderCut(
        pieces,
        (progress) => setState({ at: "rendering", progress }),
        controller.signal
      );
      if (controller.signal.aborted) return;
      const done: Done = {
        at: "done",
        result,
        url: URL.createObjectURL(result.blob),
      };
      setState(done);
      onDone(done);
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({
        at: "failed",
        message:
          error instanceof Error ? error.message : "The cut could not be made.",
      });
    } finally {
      if (running.current === controller) running.current = null;
    }
  };

  const cancel = () => {
    running.current?.abort();
    running.current = null;
    setState({ at: "ready" });
  };

  const tooLarge = state.at === "done" && state.result.blob.size > KEEP_BYTES;
  const save = async () => {
    if (state.at !== "done" || tooLarge) return;
    setSaved("saving");
    const form = new FormData();
    form.set("file", state.result.blob, `cut.${state.result.ext}`);
    form.set("title", title);
    form.set("seconds", String(state.result.seconds));
    if (sessionId) form.set("sessionId", sessionId);
    const res = await fetch("/api/cuts", { method: "POST", body: form }).catch(
      () => null
    );
    setSaved(res?.ok ? "yes" : "failed");
  };

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "cut";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[20px] font-medium tracking-[-0.01em]">
          Cut it together
        </DialogTitle>
        <DialogDescription>
          The pieces of this run as one film, made here in your browser.
        </DialogDescription>
      </DialogHeader>

      {state.at !== "done" && (
        <ol className="mt-2 space-y-1.5">
          {lanes.map(([lane, what]) => (
            <li
              key={lane}
              className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3 rounded-control bg-surface-3 px-3 py-2 text-[13.5px]"
            >
              <span className="text-mute">{lane}</span>
              <span className="truncate text-fg">{what}</span>
            </li>
          ))}
        </ol>
      )}

      {state.at === "rendering" && (
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full bg-sun transition-[width] duration-200"
              style={{ width: `${Math.round(state.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-fg-2">
            <Spinner className="size-3" /> Cutting,{" "}
            {Math.round(state.progress * 100)}%
          </p>
          {/* announced in quarters, not every percent */}
          <p className="sr-only" aria-live="polite">
            Cutting, {Math.floor(state.progress * 4) * 25}%
          </p>
        </div>
      )}

      {state.at === "failed" && (
        <p role="alert" className="mt-4 text-[13.5px] text-poor">
          {state.message}
        </p>
      )}

      {state.at === "done" && (
        <video
          src={state.url}
          controls
          autoPlay
          playsInline
          className={cn(
            "mt-2 max-h-[52vh] w-full rounded-media bg-bg object-contain"
          )}
        />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {state.at === "done" ? (
          <>
            <Button asChild size="sm">
              <a href={state.url} download={`${slug}.${state.result.ext}`}>
                <Download /> Download
              </a>
            </Button>
            {canSave && tooLarge && (
              <span className="text-[13px] text-mute">
                This cut is too long to keep in the library. Download it.
              </span>
            )}
            {canSave && !tooLarge && (
              <Button
                variant="secondary"
                size="sm"
                onClick={save}
                disabled={saved === "saving" || saved === "yes"}
              >
                {saved === "yes" ? <Check /> : <Film />}
                {saved === "yes"
                  ? "In your library"
                  : saved === "saving"
                    ? "Saving…"
                    : "Save to library"}
              </Button>
            )}
            {saved === "failed" && (
              <span role="alert" className="text-[13px] text-poor">
                It did not save. Try again.
              </span>
            )}
          </>
        ) : (
          <>
            {state.at !== "rendering" && (
              <Button size="sm" onClick={render}>
                <Scissors /> {state.at === "failed" ? "Try again" : "Cut it"}
              </Button>
            )}
            {state.at === "rendering" && (
              <Button variant="secondary" size="sm" onClick={cancel}>
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
