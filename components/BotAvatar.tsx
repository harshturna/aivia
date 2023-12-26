import { Avatar, AvatarImage } from "./ui/avatar";

// TODO: Update the avatar image to be a bot avatar

interface BotAvatarProps {
  src?: string;
}

export const BotAvatar = ({ src }: BotAvatarProps) => (
  <Avatar className="h-8 w-8">
    <AvatarImage className="p-1" src={src ? src : "/logo.png"} />
  </Avatar>
);
