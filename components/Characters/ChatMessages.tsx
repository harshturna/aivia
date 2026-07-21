"use client";

import { Character } from "@prisma/client";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import { ElementRef, useEffect, useRef } from "react";

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
        role="system"
        content={`Hello, I am ${character.name}, ${character.description}`}
      />
      {messages.map((message, i) => (
        <ChatMessage
          key={`${message.content}-${i}`}
          role={message.role}
          content={message.content}
          src={character.src}
        />
      ))}
      {isLoading && <ChatMessage role="system" src={character.src} isLoading />}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default ChatMessages;
