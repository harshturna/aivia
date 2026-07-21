import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

// Sized by the caller. The previous version hardcoded 50x50, which overflowed
// the 32px slot in every sidebar and collided with the wordmark.
const Logo = ({ className }: { className?: string }) => {
  return (
    <Brain
      className={cn("h-8 w-8 text-primary", className)}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    />
  );
};

export default Logo;
