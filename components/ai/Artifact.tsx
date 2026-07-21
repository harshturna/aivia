"use client";

import Image from "next/image";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getToolName, type ToolUIPart, type DynamicToolUIPart } from "ai";

const LABELS: Record<string, { running: string; done: string }> = {
  generate_image: { running: "Generating image", done: "Image" },
  generate_video: { running: "Generating video", done: "Video" },
  generate_music: { running: "Composing music", done: "Music" },
};

const Shell = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="my-3 overflow-hidden rounded-lg border border-black/10 bg-white">
    <div className="border-b border-black/5 bg-black/[0.02] px-3 py-2 text-xs font-medium text-zinc-600">
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
    const prompt = (part.input as { prompt?: string } | undefined)?.prompt;
    return (
      <Shell
        title={
          <span className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            {label.running}…
          </span>
        }
      >
        {prompt && (
          <p className="text-xs italic leading-5 text-zinc-500">“{prompt}”</p>
        )}
      </Shell>
    );
  }

  if (part.state === "output-error") {
    return (
      <Shell
        title={
          <span className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {label.done} failed
          </span>
        }
      >
        <p className="text-xs text-zinc-600">{part.errorText}</p>
      </Shell>
    );
  }

  const output = part.output as
    | { url?: string; urls?: string[]; prompt?: string }
    | undefined;

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

      {name === "generate_music" && urls[0] && (
        <audio controls src={urls[0]} className="w-full" />
      )}

      {output.prompt && (
        <p className="mt-2 text-xs italic leading-5 text-zinc-500">
          “{output.prompt}”
        </p>
      )}
    </Shell>
  );
};
