"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Character, Message } from "@prisma/client";
import ChatHeader from "./ChatHeader";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import ChatForm from "@/components/Characters/ChatForm";
import ChatMessages from "@/components/Characters/ChatMessages";
import { ChatMessageProps } from "@/components/Characters/ChatMessage";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setInput(target.value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the default form submission behavior

    if (!input) {
      return;
    }
    const userMessage = {
      role: "user",
      content: input,
    };

    // Update the messages state
    setMessages((current) => [...current, userMessage]);

    try {
      setIsLoading(true);
      setInput("");
      const { data } = await axios.post(`/api/chat/${character.id}`, {
        messages: [...messages, userMessage],
      });
      setMessages((current) => [...current, data]);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
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
