"use client";

import Image from "next/image";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { getToolName, type ToolUIPart, type DynamicToolUIPart } from "ai";

const LABELS: Record<string, { running: string; done: string }> = {
  generate_image: { running: "Generating image", done: "Image" },
  generate_video: { running: "Generating video", done: "Video" },
  generate_music: { running: "Composing music", done: "Music" },
  generate_sound_effect: { running: "Generating sound", done: "Sound effect" },
  web_search: { running: "Searching the web", done: "Sources" },
  // web_search_20260209 filters results by running code server-side, which
  // surfaces as its own tool call.
  code_execution: { running: "Filtering results", done: "Filtered results" },
};

interface WebSearchResult {
  type: "web_search_result";
  url: string;
  title: string | null;
}

const SearchResults = ({ results }: { results: WebSearchResult[] }) => (
  <ol className="space-y-1.5">
    {results.map((result, index) => (
      <li key={`${result.url}-${index}`} className="flex gap-2 text-xs">
        <span className="shrink-0 text-muted-foreground">{index + 1}.</span>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 text-primary underline underline-offset-2"
        >
          <span className="line-clamp-1">
            {result.title || new URL(result.url).hostname}
          </span>
        </a>
      </li>
    ))}
  </ol>
);

const Shell = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="my-3 overflow-hidden rounded-lg border border-border bg-card">
    <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
      {title}
    </div>
    {children && <div className="p-3">{children}</div>}
  </div>
);

/**
 * Renders a single tool invocation: its progress while running, and whatever
 * it produced once finished.
 *
 * Media generation takes tens of seconds, so the running state has to be
 * genuinely informative — it shows the prompt the model actually wrote, which
 * is usually different from what the user typed and is half the fun of
 * watching an agent work.
 */
export const Artifact = ({
  part,
}: {
  part: ToolUIPart | DynamicToolUIPart;
}) => {
  const name = getToolName(part);
  const label = LABELS[name] ?? { running: name, done: name };

  if (part.state === "input-streaming" || part.state === "input-available") {
    const input = part.input as { prompt?: string; query?: string } | undefined;
    // Media tools carry a prompt; the search tool carries a query.
    const detail = input?.prompt ?? input?.query;
    return (
      <Shell
        title={
          <span className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            {label.running}…
          </span>
        }
      >
        {detail && (
          <p className="text-xs italic leading-5 text-muted-foreground">
            “{detail}”
          </p>
        )}
      </Shell>
    );
  }

  if (part.state === "output-error") {
    return (
      <Shell
        title={
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {label.done} failed
          </span>
        }
      >
        <p className="text-xs text-muted-foreground">{part.errorText}</p>
      </Shell>
    );
  }

  // Web search is provider-executed and returns an array of results rather
  // than the { url } / { urls } shape the media tools use.
  if (name === "web_search") {
    const results = (
      Array.isArray(part.output) ? part.output : []
    ) as WebSearchResult[];

    if (!results.length) return null;

    return (
      <Shell
        title={
          <span className="flex items-center gap-2">
            <Search className="h-3 w-3" aria-hidden="true" />
            {label.done} ({results.length})
          </span>
        }
      >
        <SearchResults results={results} />
      </Shell>
    );
  }

  const output = part.output as
    { url?: string; urls?: string[]; prompt?: string } | undefined;

  if (!output) return null;

  const urls = output.urls ?? (output.url ? [output.url] : []);

  return (
    <Shell title={label.done}>
      {name === "generate_image" && (
        <div className="grid grid-cols-2 gap-2">
          {urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <Image
                src={url}
                alt={output.prompt ?? "Generated image"}
                width={512}
                height={512}
                unoptimized
                className="w-full rounded-md"
              />
            </a>
          ))}
        </div>
      )}

      {name === "generate_video" && urls[0] && (
        <video controls src={urls[0]} className="w-full rounded-md" />
      )}

      {(name === "generate_music" || name === "generate_sound_effect") &&
        urls[0] && <audio controls src={urls[0]} className="w-full" />}

      {output.prompt && (
        <p className="mt-2 text-xs italic leading-5 text-muted-foreground">
          “{output.prompt}”
        </p>
      )}
    </Shell>
  );
};
