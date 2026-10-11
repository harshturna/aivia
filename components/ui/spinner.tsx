import { cn } from "@/lib/utils";

/** The ring that marks a running job: a thin arc in ink, turning once a second. */
export function Spinner({
  className,
  label = "Working",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-fg border-r-transparent",
        className
      )}
    />
  );
}
