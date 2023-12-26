"use client";

import { Character } from "@prisma/client";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import { ElementRef, useEffect, useRef, useState } from "react";

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
  const [fakeLoading, setFakeLoading] = useState(
    messages.length === 0 ? true : false
  );
  const scrollRef = useRef<ElementRef<"div">>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // to scroll the user's view to the last message
  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
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
