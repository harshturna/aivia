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

// TODO: remove the _count from props

interface ChatHeaderProps {
  character: Character & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
  currentUserId: string;
}

const ChatHeader = ({ character, currentUserId }: ChatHeaderProps) => {
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
    <div className="flex w-full justify-between items-center border-b border-slate-300/50 pb-4">
      <div className="flex gap-x-2 items-center">
        <Button size="icon" variant="ghost">
          <ChevronLeft className="h-8 w-8" onClick={() => router.back()} />
        </Button>
        <BotAvatar src={character.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 ">
            <p className="font-bolt">{character.name}</p>
          </div>
        </div>
      </div>
      {currentUserId === character.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="hover:bg-slate-100/50 rounded-sm  text-black w-9 h-9 p-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/characters/${character.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
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
