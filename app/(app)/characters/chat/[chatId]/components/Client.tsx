"use client";

import { useChat } from "@ai-sdk/react";
import type { Character, Message } from "@prisma/client";
import { DefaultChatTransport } from "ai";
import { type ChangeEvent, type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import ChatForm from "@/components/Characters/ChatForm";
import type { ChatMessageProps } from "@/components/Characters/ChatMessage";
import ChatMessages from "@/components/Characters/ChatMessages";
import ChatHeader from "./ChatHeader";

interface ChatClientProps {
  character: Character & {
    messages: Message[];
  };
  currentUserId: string;
  isGuest: boolean;
}

const ChatClient = ({
  character,
  currentUserId,
  isGuest = true,
}: ChatClientProps) => {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: `/api/chat/${character.id}` }),
    onError: (error) => {
      const message = error?.message ?? "";
      toast.error(
        message.includes("limit reached")
          ? "Demo generation limit reached. Please try again later."
          : "Something went wrong"
      );
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    sendMessage({ text: prompt });
    setInput("");
  };

  // ChatMessage predates the SDK and models roles as "system" | "user",
  // where "system" means the character's reply.
  const uiMessages: ChatMessageProps[] = messages.map((message) => ({
    from: message.role === "user" ? "user" : "system",
    content: message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { text: string }).text)
      .join(""),
    src: character.src,
  }));

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader
        character={character}
        currentUserId={currentUserId}
        isGuest={isGuest}
      />
      <ChatMessages
        character={character}
        // Only show the typing indicator while waiting for the first token.
        // Once text is streaming, the message itself is the progress signal.
        isLoading={status === "submitted"}
        messages={uiMessages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default ChatClient;
