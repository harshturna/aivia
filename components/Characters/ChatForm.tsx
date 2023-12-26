"use client";

import { ChatRequestOptions } from "ai";
import { ChangeEvent, FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";

interface ChatFormProps {
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
  isLoading: boolean;
}

const ChatForm = ({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
}: ChatFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-slate-200/50 flex py-4 items-center gap-x-2"
    >
      <Input
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message"
        className="rounded-lg bg-slate-200/50"
      />
      <Button disabled={isLoading} variant="ghost">
        <SendHorizonal />
      </Button>
    </form>
  );
};

export default ChatForm;
