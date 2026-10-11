import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A small pill (design §2.2): the composer's mode and parameter chips, example prompts,
 * source chips. `on` is the selected state: white on a lighter surface, never a colour.
 */
export interface PillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  on?: boolean;
  asChild?: boolean;
}

const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ className, on = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={props["aria-pressed"] ?? (on ? true : undefined)}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium leading-none transition-colors duration-150 disabled:opacity-40 [&_svg]:size-3.5",
        on
          ? "border-transparent bg-surface-3 text-fg"
          : "border-border bg-transparent text-fg-2 hover:border-border-strong hover:text-fg",
        className
      )}
      {...props}
    />
  )
);
Pill.displayName = "Pill";

export { Pill };
