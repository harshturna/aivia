// ÷import { Avatar, AvatarImage } from "./ui/avatar";

import { Bot } from "lucide-react";

interface BotAvatarProps {
  src?: string;
}

export const BotAvatar = ({ src }: BotAvatarProps) => (
  <Bot className="w-[30px] h-[30px]" />
);
