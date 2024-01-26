import { Avatar, AvatarImage } from "./ui/avatar";

import { Bot } from "lucide-react";

interface BotAvatarProps {
  src?: string;
}

export const BotAvatar = ({ src }: BotAvatarProps) => {
  return (
    <>
      {src ? (
        <Avatar className="h-8 w-8">
          <AvatarImage className="p-1" src={src} />
        </Avatar>
      ) : (
        <Bot className="w-[30px] h-[30px]" />
      )}
    </>
  );
};
