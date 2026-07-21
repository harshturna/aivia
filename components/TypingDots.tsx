import { cn } from "@/lib/utils";

/**
 * Three-dot typing indicator with an actual stagger.
 *
 * The previous implementations used Tailwind's delay-100/delay-200 on
 * animate-bounce, but delay-* sets transition-delay, not animation-delay, so
 * all three dots bounced in unison.
 */
export const TypingDots = ({ className }: { className?: string }) => (
  <span
    className={cn("inline-flex items-center gap-1", className)}
    role="status"
    aria-label="Generating response"
  >
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current animate-typing-dot motion-reduce:animate-none"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </span>
);
