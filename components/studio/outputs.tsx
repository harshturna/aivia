"use client";

import { type DynamicToolUIPart, getToolName, type ToolUIPart } from "ai";
import { AlertTriangle, RotateCcw, Search, Square } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  actionsFor,
  HoverActions,
  MediaMenu,
  useIndexed,
  useMediaHandlers,
} from "@/components/media/actions";
import { AudioRow } from "@/components/studio/audio-row";
import { RevealImage } from "@/components/studio/reveal-image";
import { Skeleton } from "@/components/ui/skeleton";
import { plainFailure } from "@/lib/ai/failure";
import { cn } from "@/lib/utils";

/**
 * The outputs of a run (design §5.3): every tool result at its final shape, so nothing
 * jumps when it lands. Media is borderless at the media radius and reveals from blur.
 */
export type ToolPart = ToolUIPart | DynamicToolUIPart;

interface OutputActions {
  /** The run is still working; a part left unfinished by a run that ended was stopped. */
  active?: boolean;
  onReusePrompt?: (prompt: string) => void;
  /** Make this piece again; the run's other pieces stay (TICKET-051). */
  onRetry?: () => void;
}

type Output = { url?: string; urls?: string[]; prompt?: string };
type SearchResult = {
  type: "web_search_result";
  url: string;
  title: string | null;
};

/**
 * A media box that keeps one shape from placeholder to result, so nothing jumps when it lands
 * (TICKET-051): its width is the column, capped, and capped again so it is never taller than
 * 70% of the screen.
 */
function box(aspect: string | undefined, fallback: string, maxPx: number) {
  const [w, h] = (aspect ?? fallback).split(/[:/]/).map(Number);
  const ratio = w > 0 && h > 0 ? w / h : 1;
  return {
    aspectRatio: String(ratio),
    width: `min(100%, ${maxPx}px, calc(70vh * ${ratio.toFixed(4)}))`,
  };
}

const RUNNING_LABEL: Record<string, string> = {
  generate_image: "Generating the image",
  generate_video: "Generating the clip",
  generate_music: "Composing the track",
  generate_sound_effect: "Making the sound",
};

export function ToolOutput({
  part,
  ...actions
}: { part: ToolPart } & OutputActions) {
  const name = getToolName(part);
  const input = part.input as
    | { prompt?: string; amount?: number; aspect?: string }
    | undefined;

  if (name === "code_execution") return null;

  const what = RUNNING_LABEL[name]?.replace(/^\w+ing /, "") ?? name;
  if (part.state === "output-error") {
    return (
      <Failed
        what={what}
        reason={plainFailure(part.errorText)}
        onRetry={actions.onRetry}
      />
    );
  }
  // Stop, a closed tab or a dropped connection leaves a part without its result: say so
  // rather than showing it as still on its way (TICKET-043)
  const unfinished =
    part.state === "input-streaming" || part.state === "input-available";
  if (unfinished && actions.active === false && name !== "web_search") {
    return (
      <Failed
        what={what}
        stopped
        headline="Stopped before it finished."
        onRetry={actions.onRetry}
      />
    );
  }

  if (name === "web_search") {
    if (part.state !== "output-available") {
      if (actions.active === false) return null;
      return (
        <p className="flex items-center gap-2 text-[13px] text-fg-2">
          <Search className="size-3.5 animate-pulse" /> Searching the web…
          {input && "query" in (input as object)
            ? `: ${(input as { query?: string }).query}`
            : ""}
        </p>
      );
    }
    const results = (
      Array.isArray(part.output) ? part.output : []
    ) as SearchResult[];
    return <Sources results={results} />;
  }

  const running = unfinished;
  const prompt =
    (part.output as Output | undefined)?.prompt ?? input?.prompt ?? "";

  if (running) {
    if (name === "generate_music" || name === "generate_sound_effect") {
      return (
        <Skeleton className="flex h-14 items-center px-4 text-[13px] text-mute">
          {RUNNING_LABEL[name]}…
        </Skeleton>
      );
    }
    const video = name === "generate_video";
    const count = video ? 1 : Math.min(input?.amount ?? 1, 4);
    const shape = box(input?.aspect, video ? "16:9" : "1:1", video ? 760 : 560);
    return (
      <div className={cn("grid gap-2", count > 1 && "grid-cols-2")}>
        {Array.from({ length: count }, (_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholders are positional
            key={i}
            className="flex items-end p-3 text-[13px] leading-5 text-mute"
            style={count === 1 ? shape : { aspectRatio: shape.aspectRatio }}
          >
            <span className="line-clamp-3">
              {i === 0
                ? prompt
                  ? `“${prompt}”`
                  : `${RUNNING_LABEL[name]}…`
                : ""}
              {i === 0 && name === "generate_video" && (
                <span className="mt-1 block text-[12px]">
                  Usually a minute or two
                </span>
              )}
            </span>
          </Skeleton>
        ))}
      </div>
    );
  }

  const output = part.output as Output | undefined;
  if (!output) return null;
  const urls = output.urls ?? (output.url ? [output.url] : []);

  if (name === "generate_image") {
    return <Images urls={urls} prompt={prompt} aspect={input?.aspect} />;
  }
  if (name === "generate_video" && urls[0]) {
    return <ClipOutput url={urls[0]} prompt={prompt} aspect={input?.aspect} />;
  }
  if (
    (name === "generate_music" || name === "generate_sound_effect") &&
    urls[0]
  ) {
    return (
      <AudioOutput
        url={urls[0]}
        prompt={prompt}
        kind={name === "generate_music" ? "music" : "sound"}
      />
    );
  }
  return null;
}

/** A clip in the thread: its own shape, native controls, and the shared actions top right. */
function ClipOutput({
  url,
  prompt,
  aspect,
}: {
  url: string;
  prompt: string;
  aspect?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  return (
    <figure>
      <div className="group relative w-fit">
        <video
          ref={video}
          controls
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          src={url}
          data-media-url={url}
          // in its own shape: an animated portrait still stays portrait (TICKET-039)
          style={box(aspect, "16:9", 760)}
          className="rounded-media bg-surface object-contain"
        />
        <HoverActions
          item={{ url, kind: "video", prompt }}
          label={prompt || "the clip"}
          video={() => video.current}
          touchMenu
        />
      </div>
      <Caption prompt={prompt} />
    </figure>
  );
}

/** A track or a sound: the row, and its actions under "⋯". */
function AudioOutput({
  url,
  prompt,
  kind,
}: {
  url: string;
  prompt: string;
  kind: "music" | "sound";
}) {
  const item = useIndexed({ url, kind, prompt });
  const actions = actionsFor(item, useMediaHandlers()).filter(
    (a) => a.id !== "download"
  );
  const title = titleFrom(prompt) || (kind === "music" ? "Track" : "Sound");
  return (
    <div data-media-url={url}>
      <AudioRow
        src={url}
        title={title}
        subtitle={kind === "music" ? "Music" : "Sound effect"}
        action={
          actions.length > 0 ? (
            <MediaMenu
              actions={actions}
              label={title}
              className="size-8 bg-transparent text-mute hover:bg-surface-2 hover:text-fg"
            />
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * A short title from the prompt the model wrote: its opening words, enough to name it
 * (a first clause like "A single" is too short, so clauses join until there are four words).
 */
export function titleFrom(prompt: string) {
  const words: string[] = [];
  for (const clause of prompt.split(/[,.;:]/)) {
    words.push(...clause.trim().split(/\s+/).filter(Boolean));
    if (words.length >= 4) break;
  }
  const title = words.slice(0, 7).join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "";
}

function Images({
  urls,
  prompt,
  aspect,
}: {
  urls: string[];
  prompt: string;
  aspect?: string;
}) {
  return (
    <figure>
      <div className={cn("grid gap-2", urls.length > 1 && "grid-cols-2")}>
        {urls.map((url, i) => (
          <RevealedImage
            key={url}
            url={url}
            alt={
              urls.length > 1
                ? `${prompt || "Generated image"} (${i + 1} of ${urls.length})`
                : prompt || "Generated image"
            }
            prompt={prompt}
            aspect={aspect}
            single={urls.length === 1}
          />
        ))}
      </div>
      <Caption prompt={prompt} />
    </figure>
  );
}

function RevealedImage({
  url,
  alt,
  prompt,
  aspect,
  single,
}: {
  url: string;
  alt: string;
  prompt: string;
  /** The shape it was asked for; without one (an example, an old run) the image's own. */
  aspect?: string;
  single: boolean;
}) {
  // the buttons say which image they act on: a grid of four has four of each
  const label = alt.length > 48 ? `${alt.slice(0, 45).trimEnd()}…` : alt;
  const [natural, setNatural] = useState<string>();
  const frame = useRef<HTMLDivElement>(null);
  const measure = useCallback((img: HTMLImageElement | null | undefined) => {
    if (img?.naturalWidth && img.naturalHeight)
      setNatural(`${img.naturalWidth}:${img.naturalHeight}`);
  }, []);
  // a server-rendered image can finish loading before React listens for it
  useLayoutEffect(() => {
    measure(frame.current?.querySelector("img"));
  }, [measure]);
  const shape = box(aspect ?? natural, "1:1", 560);
  // on a touch screen the actions wait for a tap on the image: Animate spends a generation,
  // and an always-on button sits under a scrolling thumb (TICKET-051)
  const [shown, setShown] = useState(false);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: a tap shows the actions; keyboard reaches them by focus
    // biome-ignore lint/a11y/noStaticElementInteractions: as above
    <div
      ref={frame}
      className="group relative overflow-hidden rounded-media bg-surface"
      style={single ? shape : { aspectRatio: shape.aspectRatio }}
      onClick={(event) => {
        if (event.target === event.currentTarget.querySelector("img"))
          setShown((s) => !s);
      }}
    >
      <RevealImage
        src={url}
        alt={alt}
        loading="lazy"
        onLoad={(event) => measure(event.currentTarget)}
        className="block size-full object-cover"
      />
      <HoverActions
        item={{ url, kind: "image", prompt }}
        label={label}
        shown={shown}
      />
    </div>
  );
}

/** The prompt under a picture; its actions live in the picture's cluster (TICKET-063). */
function Caption({ prompt }: { prompt: string }) {
  if (!prompt) return null;
  return (
    <figcaption className="mt-2 line-clamp-2 text-[12px] leading-4 text-mute">
      {prompt}
    </figcaption>
  );
}

function Sources({ results }: { results: SearchResult[] }) {
  const [open, setOpen] = useState(false);
  if (!results.length) return null;
  const shown = open ? results : results.slice(0, 4);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((r, i) => {
        let host = r.url;
        try {
          host = new URL(r.url).hostname.replace(/^www\./, "");
        } catch {}
        return (
          <a
            key={`${r.url}-${i}`}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            title={r.title ?? host}
            className="inline-flex h-7 max-w-[220px] items-center gap-1.5 rounded-full border border-border px-2.5 text-[12px] text-fg-2 transition-colors hover:border-border-strong hover:text-fg"
          >
            {/* biome-ignore lint/performance/noImgElement: a 14 px favicon */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
              alt=""
              className="size-3.5 rounded-sm"
            />
            <span className="truncate">{host}</span>
          </a>
        );
      })}
      {results.length > 4 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-7 rounded-full px-2 text-[12px] text-mute transition-colors hover:text-fg"
        >
          {open ? "Fewer" : `${results.length - 4} more`}
        </button>
      )}
    </div>
  );
}

function Failed({
  what,
  headline,
  reason,
  stopped = false,
  onRetry,
}: {
  what: string;
  headline?: string;
  reason?: string;
  /** Stopped by the person, or cut off: not an error, so not shown as one. */
  stopped?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-media border border-border bg-surface p-4 text-[13px]">
      {stopped ? (
        <Square className="mt-0.5 size-3.5 shrink-0 text-mute" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-poor" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-fg">
          {headline ?? `Could not make ${what || "the output"}.`}
        </p>
        {reason && <p className="mt-1 line-clamp-3 text-mute">{reason}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 text-fg-2 transition-colors hover:text-fg"
        >
          <RotateCcw className="size-3.5" /> Try again
        </button>
      )}
    </div>
  );
}
