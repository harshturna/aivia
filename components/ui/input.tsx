import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/** A text field (design §2.2): a surface with a hairline; focus draws it in half-strength ink, clearly past hover. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-control border border-border bg-surface px-3 text-[14px] text-fg transition-colors duration-150 placeholder:text-mute hover:border-border-strong focus-visible:border-fg/50 focus-visible:outline-none aria-invalid:border-poor/70 disabled:cursor-not-allowed disabled:opacity-40 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
