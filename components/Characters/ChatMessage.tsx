"use client";

import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { BotAvatar } from "../BotAvatar";
import { UserAvatar } from "../UserAvatar";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { TypingDots } from "../TypingDots";

export interface ChatMessageProps {
  role: "system" | "user";
  content?: string;
  isLoading?: boolean;
  src?: string;
}

const ChatMessage = ({ role, content, isLoading, src }: ChatMessageProps) => {
  const onCopy = () => {
    if (!content) {
      return;
    }

    navigator.clipboard.writeText(content);
    toast("Message copied to clipboard");
  };

  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-x-3 py-4",
        isUser && "justify-end"
      )}
    >
      {!isUser && src && <BotAvatar src={src} />}
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-sm leading-6",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isLoading ? <TypingDots className="text-muted-foreground" /> : content}
      </div>
      {isUser && <UserAvatar />}
      {!isUser && !isLoading && (
        <Button
          onClick={onCopy}
          aria-label="Copy message to clipboard"
          className="opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100"
          size="icon"
          variant="ghost"
        >
          <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
};

export default ChatMessage;
