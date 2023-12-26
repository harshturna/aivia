"use client";

import { useState, useEffect, FormEvent } from "react";
import { Character, Message } from "@prisma/client";
import ChatHeader from "./ChatHeader";
import { useRouter } from "next/navigation";
import { useCompletion } from "ai/react";
import ChatForm from "@/components/Characters/ChatForm";
import ChatMessages from "@/components/Characters/ChatMessages";
import { ChatMessageProps } from "@/components/Characters/ChatMessage";

// TODO: remove the _count props

interface ChatClientProps {
  character: Character & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
  currentUserId: string;
}

const ChatClient = ({ character, currentUserId }: ChatClientProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>(character.messages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat${character.id}`,
      onFinish(_, completion) {
        const systemMesage: ChatMessageProps = {
          role: "system",
          content: completion,
        };

        setMessages((current) => [...current, systemMesage]);
        setInput("");

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };

    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader character={character} currentUserId={currentUserId} />
      <ChatMessages
        character={character}
        isLoading={isLoading}
        messages={messages}
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
