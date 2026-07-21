"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

import Heading from "@/components/Heading";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { userProModal } from "@/hooks/useProModal";

const ConversationPage = () => {
  const proModal = userProModal();
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/conversation" }),
    onError: (error) => {
      const message = error?.message ?? "";

      if (message.includes("Free trial")) {
        proModal.onOpen();
        return;
      }

      if (message.includes("limit reached")) {
        toast.error(
          "Demo generation limit reached. Please try again later."
        );
        return;
      }

      toast.error("Something went wrong");
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

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
        title="Conversations"
        description="Chat with Aivia, your friendly AI"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <form
            onSubmit={onSubmit}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <div className="col-span-12 lg:col-span-10">
              <Input
                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                disabled={isStreaming}
                placeholder="How do I calculate the radius of a circle?"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </div>
            {isStreaming ? (
              <Button
                type="button"
                variant="secondary"
                onClick={stop}
                className="col-span-12 lg:col-span-2 w-full"
              >
                <Square className="h-4 w-4 mr-2" aria-hidden="true" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                className="col-span-12 lg:col-span-2 w-full"
                disabled={!input.trim()}
              >
                Generate
              </Button>
            )}
          </form>
        </div>
        <div className="space-y-4 mt-4">
          {!messages.length && !isStreaming && (
            <Empty label="no conversation started" />
          )}
          {/* Natural order: oldest first. The previous flex-col-reverse
              rendered the conversation bottom-to-top. */}
          <div className="flex flex-col gap-y-4">
            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => (part as { text: string }).text)
                .join("");

              return (
                <div
                  key={message.id}
                  className={cn(
                    "p-8 w-full grid character-grid items-start gap-x-8 rounded-lg",
                    message.role === "user"
                      ? "bg-white border border-black/10"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <UserAvatar color="violet" />
                  ) : (
                    <BotAvatar />
                  )}
                  <div className="text-sm overflow-hidden leading-7 break-words">
                    <ReactMarkdown
                      components={{
                        pre: ({ node, ...props }) => (
                          <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ node, ...props }) => (
                          <code className="bg-black/10 rounded px-1" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-6 my-2" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-6 my-2" {...props} />
                        ),
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
          {status === "submitted" && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
