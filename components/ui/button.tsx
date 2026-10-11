import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The button (design §2.2). The primary is white on black; there is no chromatic accent.
 * Sizes are heights on the 4 px grid; `icon` is square.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control text-[13.5px] font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-[#e6e6e6]",
        secondary:
          "border border-border bg-surface-2 text-fg hover:bg-surface-3 hover:border-border-strong",
        ghost: "text-fg-2 hover:bg-surface-2 hover:text-fg",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-surface-2",
        destructive: "bg-poor text-black hover:bg-poor/90",
        link: "h-auto px-0 text-fg underline underline-offset-4 hover:text-fg-2",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11 px-5 text-[14px]",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
