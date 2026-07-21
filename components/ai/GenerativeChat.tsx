"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Paperclip, Square, X, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import Heading from "@/components/Heading";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { Markdown } from "@/components/ai/Markdown";
import { userProModal } from "@/hooks/useProModal";

interface GenerativeChatProps {
  api: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  placeholder: string;
  emptyLabel: string;
  /** Show a file picker beside the input. */
  attachments?: {
    /** `accept` attribute, e.g. "application/pdf,text/*". */
    accept: string;
    label: string;
  };
}

/**
 * Shared streaming chat surface.
 *
 * The conversation and code pages were previously identical files differing
 * only in endpoint, icon and placeholder, which meant every fix had to be made
 * twice (and usually wasn't).
 */
export const GenerativeChat = ({
  api,
  title,
  description,
  icon,
  iconColor,
  bgColor,
  placeholder,
  emptyLabel,
  attachments,
}: GenerativeChatProps) => {
  const proModal = userProModal();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api }),
    onError: (error) => {
      const message = error?.message ?? "";

      if (message.includes("Free trial")) {
        proModal.onOpen();
        return;
      }
      if (message.includes("limit reached")) {
        toast.error("Demo generation limit reached. Please try again later.");
        return;
      }
      toast.error("Something went wrong");
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  // Follow the response as it streams in, not just when a message is added.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const clearFiles = () => {
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    sendMessage({ text: prompt, files });
    setInput("");
    clearFiles();
  };

  return (
    // Column layout with the transcript growing and the composer pinned to the
    // bottom of the viewport. The composer used to sit above the messages, so
    // it scrolled out of view as soon as a conversation got long.
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <Heading
        title={title}
        description={description}
        icon={icon}
        iconColor={iconColor}
        bgColor={bgColor}
      />

      <div className="flex-1 px-4 lg:px-8">
        <div className="space-y-4">
          {!messages.length && !isStreaming && <Empty label={emptyLabel} />}

          {/* Oldest first. This previously used flex-col-reverse over a
              non-reversed array, so conversations read bottom-to-top. */}
          <div className="flex flex-col gap-y-4">
            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => (part as { text: string }).text)
                .join("");

              const reasoning = message.parts
                .filter((part) => part.type === "reasoning")
                .map((part) => (part as { text: string }).text)
                .join("")
                .trim();

              const attached = message.parts.filter(
                (part) => part.type === "file"
              ) as Array<{ filename?: string; mediaType: string }>;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "character-grid grid w-full items-start gap-x-8 rounded-lg p-8",
                    message.role === "user"
                      ? "border border-border bg-card"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div className="min-w-0 text-sm">
                    {attached.length > 0 && (
                      <ul className="mb-2 flex flex-wrap gap-2">
                        {attached.map((file, i) => (
                          <li
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                          >
                            <Paperclip className="h-3 w-3" aria-hidden="true" />
                            {file.filename ?? file.mediaType}
                          </li>
                        ))}
                      </ul>
                    )}
                    {reasoning && (
                      <details className="mb-3 rounded-md border border-border bg-muted/50">
                        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                          {text ? "Reasoning" : "Thinking…"}
                        </summary>
                        <div className="whitespace-pre-wrap px-3 pb-3 text-xs leading-6 text-muted-foreground">
                          {reasoning}
                        </div>
                      </details>
                    )}
                    <Markdown>{text}</Markdown>
                  </div>
                </div>
              );
            })}
          </div>

          {status === "submitted" && (
            <div className="flex w-full items-center justify-center rounded-lg bg-muted p-8">
              <Loader />
            </div>
          )}
          <div ref={bottomRef} className="scroll-mb-28" />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
        <form
          onSubmit={onSubmit}
          className="grid w-full grid-cols-12 gap-2 rounded-lg border bg-card p-2 focus-within:shadow-sm"
        >
          <div className="col-span-12 flex items-center gap-2 lg:col-span-10">
            <label htmlFor="prompt" className="sr-only">
              {placeholder}
            </label>
            <Input
              id="prompt"
              className="border-0 focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isStreaming}
              placeholder={placeholder}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            {attachments && (
              <>
                <input
                  ref={fileInputRef}
                  id="chat-files"
                  type="file"
                  accept={attachments.accept}
                  multiple
                  className="sr-only"
                  onChange={(event) => setFiles(event.target.files ?? undefined)}
                />
                <label
                  htmlFor="chat-files"
                  title={attachments.label}
                  className="shrink-0 cursor-pointer rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-within:ring-2 focus-within:ring-ring"
                >
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{attachments.label}</span>
                </label>
              </>
            )}
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
              Generate
            </Button>
          )}
        </form>

        {files && files.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" aria-hidden="true" />
            <span>
              {Array.from(files)
                .map((file) => file.name)
                .join(", ")}
            </span>
            <button
              type="button"
              onClick={clearFiles}
              className="inline-flex items-center rounded px-1.5 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Remove attachments</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
