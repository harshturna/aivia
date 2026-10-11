import { cn } from "@/lib/utils";

/** A keyboard hint beside a menu item or in the shortcuts list. */
export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-border bg-surface px-1 font-sans text-[11px] font-medium text-fg-2",
        className
      )}
    >
      {children}
    </kbd>
  );
}
