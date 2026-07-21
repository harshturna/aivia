import { Avatar } from "./ui/avatar";
import { User } from "lucide-react";

/**
 * The old version took a `color` prop and interpolated `text-${color}-500`.
 * Tailwind's scanner cannot see dynamically-built class names, so those
 * classes were purged from the build and the prop never did anything — it has
 * been dropped rather than left as a no-op.
 *
 * Filled with `primary` (coral) rather than `secondary`: secondary is a deep
 * navy that all but disappears against the near-black message surfaces.
 */
export const UserAvatar = () => {
  return (
    <Avatar className="flex h-8 w-8 items-center justify-center bg-primary">
      <User className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
    </Avatar>
  );
};
