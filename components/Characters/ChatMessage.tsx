"use client";

import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { BotAvatar } from "../BotAvatar";
import { UserAvatar } from "../UserAvatar";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

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

  return (
    <div
      className={cn(
        "group flex items-center gap-x-3 py-4 w-full",
        role === "user" && "justify-end"
      )}
    >
      {role !== "user" && src && <BotAvatar src={src} />}
      <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-slate-200/50">
        {isLoading ? (
          <div className="text-slate-600/80 flex gap-x-2">
            <p className="animate-bounce">.</p>
            <p className="animate-bounce delay-100">.</p>
            <p className="animate-bounce delay-200">.</p>
          </div>
        ) : (
          content
        )}
      </div>
      {role === "user" && <UserAvatar color="cyan" />}
      {role !== "user" && !isLoading && (
        <Button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition"
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4 text-slate-500/50" />
        </Button>
      )}
    </div>
  );
};

export default ChatMessage;
