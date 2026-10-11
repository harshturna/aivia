"use client";

import type { Character } from "@prisma/client";
import { type ElementRef, useEffect, useRef } from "react";
import ChatMessage, { type ChatMessageProps } from "./ChatMessage";

interface ChatMessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  character: Character;
}

const ChatMessages = ({
  messages,
  isLoading,
  character,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  // Follow the reply as it streams in, not only when a message is appended.
  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={false}
        src={character.src}
        from="system"
        content={`Hello, I am ${character.name}, ${character.description}`}
      />
      {messages.map((message, i) => (
        <ChatMessage
          key={`${message.content}-${i}`}
          from={message.from}
          content={message.content}
          src={character.src}
        />
      ))}
      {isLoading && <ChatMessage from="system" src={character.src} isLoading />}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default ChatMessages;
