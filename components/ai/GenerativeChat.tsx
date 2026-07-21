"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Square, type LucideIcon } from "lucide-react";
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
}: GenerativeChatProps) => {
  const proModal = userProModal();
  const [input, setInput] = useState("");
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

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    sendMessage({ text: prompt });
    setInput("");
  };

  return (
    <div>
      <Heading
        title={title}
        description={description}
        icon={icon}
        iconColor={iconColor}
        bgColor={bgColor}
      />
      <div className="px-4 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="grid w-full grid-cols-12 gap-2 rounded-lg border p-4 px-3 focus-within:shadow-sm md:px-6"
        >
          <div className="col-span-12 lg:col-span-10">
            <label htmlFor="prompt" className="sr-only">
              {placeholder}
            </label>
            <Input
              id="prompt"
              className="border-0 focus-visible:ring-1 focus-visible:ring-violet-500"
              disabled={isStreaming}
              placeholder={placeholder}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
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

        <div className="mt-4 space-y-4">
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

              return (
                <div
                  key={message.id}
                  className={cn(
                    "character-grid grid w-full items-start gap-x-8 rounded-lg p-8",
                    message.role === "user"
                      ? "border border-black/10 bg-white"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <UserAvatar color="violet" />
                  ) : (
                    <BotAvatar />
                  )}
                  <div className="min-w-0 text-sm">
                    {reasoning && (
                      <details className="mb-3 rounded-md border border-black/10 bg-black/[0.03]">
                        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900">
                          {text ? "Reasoning" : "Thinking…"}
                        </summary>
                        <div className="whitespace-pre-wrap px-3 pb-3 text-xs leading-6 text-zinc-600">
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
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
