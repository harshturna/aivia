"use client";

import { type DynamicToolUIPart, getToolName, type ToolUIPart } from "ai";
import {
  AlertTriangle,
  Download,
  Film,
  Maximize2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useStudioActions } from "@/components/studio/actions";
import { AudioRow } from "@/components/studio/audio-row";
import { RevealImage } from "@/components/studio/reveal-image";
import { Skeleton } from "@/components/ui/skeleton";
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
  onRetry?: () => void;
}

type Output = { url?: string; urls?: string[]; prompt?: string };
type SearchResult = {
  type: "web_search_result";
  url: string;
  title: string | null;
};

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
      <Failed what={what} reason={part.errorText} onRetry={actions.onRetry} />
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
    const ratio =
      name === "generate_video"
        ? "16/9"
        : (input?.aspect?.replace(":", "/") ?? "1/1");
    const count =
      name === "generate_image" ? Math.min(input?.amount ?? 1, 4) : 1;
    return (
      <div className={cn("grid gap-2", count > 1 && "grid-cols-2")}>
        {Array.from({ length: count }, (_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholders are positional
            key={i}
            className={cn(
              "flex items-end p-3 text-[13px] leading-5 text-mute",
              count === 1 && name === "generate_image" && "max-w-[420px]"
            )}
            style={{ aspectRatio: ratio }}
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
    return (
      <Images
        urls={urls}
        prompt={prompt}
        onReusePrompt={actions.onReusePrompt}
      />
    );
  }
  if (name === "generate_video" && urls[0]) {
    return (
      <figure>
        <video
          controls
          playsInline
          preload="metadata"
          src={urls[0]}
          // in its own shape: an animated portrait still stays portrait (TICKET-039)
          className="max-h-[70vh] w-auto max-w-full rounded-media bg-surface"
        />
        <Caption prompt={prompt} onReusePrompt={actions.onReusePrompt} />
      </figure>
    );
  }
  if (
    (name === "generate_music" || name === "generate_sound_effect") &&
    urls[0]
  ) {
    return (
      <AudioRow
        src={urls[0]}
        title={
          titleFrom(prompt) || (name === "generate_music" ? "Track" : "Sound")
        }
        subtitle={name === "generate_music" ? "Music" : "Sound effect"}
      />
    );
  }
  return null;
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
  onReusePrompt,
}: {
  urls: string[];
  prompt: string;
  onReusePrompt?: (prompt: string) => void;
}) {
  return (
    <figure>
      <div
        className={cn(
          "grid gap-2",
          urls.length > 1 ? "grid-cols-2" : "max-w-[560px]"
        )}
      >
        {urls.map((url) => (
          <RevealedImage
            key={url}
            url={url}
            alt={prompt || "Generated image"}
            prompt={prompt}
          />
        ))}
      </div>
      <Caption prompt={prompt} onReusePrompt={onReusePrompt} />
    </figure>
  );
}

function RevealedImage({
  url,
  alt,
  prompt,
}: {
  url: string;
  alt: string;
  prompt: string;
}) {
  const { animate } = useStudioActions();
  return (
    <div className="group relative overflow-hidden rounded-media bg-surface">
      <RevealImage
        src={url}
        alt={alt}
        loading="lazy"
        className="block w-full"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-linear-to-t from-bg/70 to-transparent p-2 pt-8 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
        {animate && (
          <button
            type="button"
            aria-label="Animate"
            title="Animate"
            onClick={(event) => {
              const img = event.currentTarget
                .closest(".group")
                ?.querySelector("img");
              animate({
                url,
                prompt,
                width: img?.naturalWidth || 1,
                height: img?.naturalHeight || 1,
              });
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-control bg-bg/60 px-2.5 text-[12.5px] font-medium text-fg backdrop-blur transition-colors hover:bg-bg/80 [&_svg]:size-4"
          >
            <Film /> Animate
          </button>
        )}
        <IconLink href={url} label="Open full size">
          <Maximize2 />
        </IconLink>
        <IconLink href={url} label="Download" download>
          <Download />
        </IconLink>
      </div>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
  download = false,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...(download ? { download: "" } : {})}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-control bg-bg/60 text-fg backdrop-blur transition-colors hover:bg-bg/80 [&_svg]:size-4"
    >
      {children}
    </a>
  );
}

function Caption({
  prompt,
  onReusePrompt,
}: {
  prompt: string;
  onReusePrompt?: (prompt: string) => void;
}) {
  if (!prompt) return null;
  return (
    <figcaption className="mt-2 flex items-start gap-3 text-[12px] leading-4 text-mute">
      <span className="line-clamp-2 min-w-0 flex-1">{prompt}</span>
      {onReusePrompt && (
        <button
          type="button"
          onClick={() => onReusePrompt(prompt)}
          className="shrink-0 text-fg-2 transition-colors hover:text-fg"
        >
          Reuse prompt
        </button>
      )}
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
  onRetry,
}: {
  what: string;
  headline?: string;
  reason?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-media border border-border bg-surface p-4 text-[13px]">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-poor" />
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
          <RotateCcw className="size-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
