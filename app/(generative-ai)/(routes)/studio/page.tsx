"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { Paperclip, Sparkles, Square, X } from "lucide-react";
import toast from "react-hot-toast";

import Heading from "@/components/Heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { Markdown } from "@/components/ai/Markdown";
import { Artifact } from "@/components/ai/Artifact";
import { userProModal } from "@/hooks/useProModal";

/**
 * Merge runs of adjacent text parts into one block, leaving everything else in
 * place.
 *
 * Anthropic's server-side web search cuts the answer into a separate text part
 * at every citation boundary, so a single sentence arrives as several parts:
 * the cited span, then the trailing ".", then the next connective. Rendering
 * each through its own <Markdown> gave every fragment its own <p>, which is
 * why answers came out with stray full stops on their own lines.
 *
 * Non-text parts still act as boundaries, so a tool call or a plan block
 * appears exactly where it happened in the run.
 */
type Grouped<T> = { kind: "text"; text: string } | { kind: "part"; part: T };

function groupTextParts<T extends { type: string }>(parts: T[]): Grouped<T>[] {
  const groups: Grouped<T>[] = [];

  for (const part of parts) {
    if (part.type === "text") {
      const previous = groups[groups.length - 1];
      const text = (part as unknown as { text: string }).text ?? "";
      if (previous?.kind === "text") {
        previous.text += text;
      } else {
        groups.push({ kind: "text", text });
      }
      continue;
    }
    groups.push({ kind: "part", part });
  }

  return groups;
}

const EXAMPLES = [
  "Design a logo for a coffee roastery and write three taglines",
  "Make a 5-second clip of rain on a window, and a lo-fi track to match",
  "Create album art for a synthwave record and name the album",
];

const StudioPage = () => {
  const proModal = userProModal();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent" }),
    onError: (error) => {
      const message = error?.message ?? "";
      if (message.includes("Free trial")) return proModal.onOpen();
      if (message.includes("limit reached")) {
        return toast.error(
          "Demo generation limit reached. Please try again later."
        );
      }
      toast.error("Something went wrong");
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const clearFiles = () => {
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const send = (text: string) => {
    if (!text.trim() || isStreaming) return;
    // Attached images ride along as file parts; Sonnet 5 reads them natively.
    sendMessage({ text: text.trim(), files });
    setInput("");
    clearFiles();
  };

  return (
    // Column layout with the transcript growing and the composer pinned to the
    // bottom of the viewport. The composer used to sit above the messages, so
    // it scrolled out of view as soon as a run got long.
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <Heading
        title="Studio"
        description="Describe what you want. Aivia plans it and builds it."
        icon={Sparkles}
        iconColor="text-primary"
        bgColor="bg-primary/10"
      />

      <div className="flex-1 px-4 lg:px-8">
        <div className="mt-4 space-y-4">
          {!messages.length && !isStreaming && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                One prompt. Aivia decides which tools to use — images, video,
                music — and runs them for you.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => send(example)}
                    className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "character-grid grid w-full items-start gap-x-8 rounded-lg p-8",
                  message.role === "user"
                    ? "border border-border bg-card"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? (
                  <UserAvatar />
                ) : (
                  <BotAvatar />
                )}

                {/* Render parts in order so the plan, the tool runs and the
                    closing summary appear as they actually happened. */}
                <div className="min-w-0 text-sm">
                  {groupTextParts(message.parts).map((group, index) => {
                    if (group.kind === "text") {
                      return <Markdown key={index}>{group.text}</Markdown>;
                    }

                    const part = group.part;

                    if (part.type === "reasoning") {
                      const text = (part as { text: string }).text?.trim();
                      if (!text) return null;
                      return (
                        <details
                          key={index}
                          className="mb-3 rounded-md border border-border bg-muted/50"
                        >
                          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                            Plan
                          </summary>
                          <div className="whitespace-pre-wrap px-3 pb-3 text-xs leading-6 text-muted-foreground">
                            {text}
                          </div>
                        </details>
                      );
                    }

                    // Images the user attached, echoed back into the transcript.
                    if (part.type === "file") {
                      const file = part as { url: string; mediaType: string };
                      if (!file.mediaType?.startsWith("image")) return null;
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={index}
                          src={file.url}
                          alt="Attached"
                          className="mb-2 max-h-48 rounded-md border border-border"
                        />
                      );
                    }

                    if (isToolUIPart(part)) {
                      return <Artifact key={index} part={part} />;
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>

          <div ref={bottomRef} className="scroll-mb-28" />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="grid w-full grid-cols-12 gap-2 rounded-lg border bg-card p-2 focus-within:shadow-sm"
        >
          <div className="col-span-12 flex items-center gap-2 lg:col-span-10">
            <label htmlFor="studio-prompt" className="sr-only">
              What should Aivia make?
            </label>
            <Input
              id="studio-prompt"
              className="border-0 focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isStreaming}
              placeholder="Design a logo for a coffee roastery and write three taglines"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <input
              ref={fileInputRef}
              id="studio-files"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => setFiles(event.target.files ?? undefined)}
            />
            <label
              htmlFor="studio-files"
              title="Attach images"
              className="shrink-0 cursor-pointer rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-within:ring-2 focus-within:ring-ring"
            >
              <Paperclip className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Attach images</span>
            </label>
          </div>
          {isStreaming ? (
            <Button
              type="button"
              variant="secondary"
              onClick={stop}
              className="col-span-12 w-full lg:col-span-2"
            >
              <Square className="mr-2 h-4 w-4" aria-hidden="true" />
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              className="col-span-12 w-full lg:col-span-2"
              disabled={!input.trim()}
            >
              Build it
            </Button>
          )}
        </form>

        {files && files.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" aria-hidden="true" />
            <span>
              {files.length} image{files.length > 1 ? "s" : ""} attached
            </span>
            <button
              type="button"
              onClick={clearFiles}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Remove attached images</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPage;
