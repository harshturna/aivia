import { Avatar } from "./ui/avatar";
import { User } from "lucide-react";

/**
 * The old version took a `color` prop and interpolated `text-${color}-500`.
 * Tailwind's scanner cannot see dynamically-built class names, so those
 * classes were purged from the build and the prop never did anything.
 */
export const UserAvatar = ({ color: _legacy }: { color?: string } = {}) => {
  return (
    <Avatar className="flex h-8 w-8 items-center justify-center bg-secondary">
      <User
        className="h-5 w-5 text-secondary-foreground"
        aria-hidden="true"
      />
    </Avatar>
  );
};
