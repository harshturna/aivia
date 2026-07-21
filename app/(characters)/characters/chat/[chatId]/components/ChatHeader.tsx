"use client";

import { BotAvatar } from "@/components/BotAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Character, Message } from "@prisma/client";
import axios from "axios";
import { ChevronLeft, Edit, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ChatHeaderProps {
  character: Character & {
    messages: Message[];
  };
  currentUserId: string;
  isGuest: boolean;
}

const ChatHeader = ({
  character,
  currentUserId,
  isGuest = true,
}: ChatHeaderProps) => {
  const router = useRouter();

  const onDelete = async () => {
    try {
      await axios.delete(`/api/characters/${character.id}`);
      toast.success("Successfuly deleted");
      router.refresh();
      router.push("/characters");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex w-full justify-between items-center border-b border-border pb-4">
      <div className="flex gap-x-2 items-center">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <BotAvatar src={character.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 ">
            <p className="font-semibold">{character.name}</p>
          </div>
        </div>
      </div>
      {currentUserId === character.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Character options">
              <MoreVertical className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/characters/${character.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} disabled={isGuest}>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ChatHeader;
