import { Avatar } from "./ui/avatar";
import { AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  color: string;
}

export const UserAvatar = ({ color = "slate" }: UserAvatarProps) => {
  return (
    <Avatar className="h-8 w-8">
      <User className={`text-${color}-500`} />
    </Avatar>
  );
};
