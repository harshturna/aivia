import { cn } from "@/lib/utils";

/**
 * A placeholder the shape of what it stands for (design §13), with the shimmer of a running
 * job. Give it the final aspect ratio so nothing jumps when the real thing arrives.
 */
export function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer rounded-media bg-surface", className)}
      {...props}
    >
      {children}
    </div>
  );
}
