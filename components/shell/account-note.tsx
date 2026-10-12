import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Where a guest gets less than an account, one quiet line says what an account does there,
 * so a reserved feature never reads as a missing one (TICKET-089).
 */
export function AccountNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[13px] leading-5 text-mute", className)}>
      {children}{" "}
      <Link
        href="/signup"
        className="whitespace-nowrap text-fg underline underline-offset-4 hover:text-fg-2"
      >
        Create an account
      </Link>
    </p>
  );
}
