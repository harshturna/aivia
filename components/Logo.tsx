import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

// Sized by the caller. The previous version hardcoded 50x50, which overflowed
// the 32px slot in every sidebar and collided with the wordmark.
const Logo = ({ className }: { className?: string }) => {
  return (
    // Not filled: Brain is a line icon, and filling it collapses the interior
    // strokes into a solid blob.
    <Brain
      className={cn("h-8 w-8 text-primary", className)}
      strokeWidth={1.75}
      aria-hidden="true"
    />
  );
};

export default Logo;
