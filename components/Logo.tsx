import { cn } from "@/lib/utils";

/**
 * The wordmark (design §2.2): the name in the one family, lowercase, tight. No icon.
 * Sized by the caller through `className` (font size); defaults to 20 px.
 */
const Logo = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "font-sans text-[20px] font-semibold leading-none tracking-[-0.02em] text-fg",
      className
    )}
  >
    aivia
  </span>
);

export default Logo;
