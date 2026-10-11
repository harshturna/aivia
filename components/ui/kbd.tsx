"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A keyboard hint beside a menu item or in the shortcuts list. ⌘ reads as Ctrl off a Mac,
 * where Ctrl is the key that works (TICKET-054); the server and first render say ⌘.
 */
export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mac, setMac] = useState(true);
  useEffect(
    () =>
      setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)),
    []
  );
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-chip border border-border bg-surface px-1 font-sans text-[11px] font-medium text-fg-2",
        className
      )}
    >
      {children === "⌘" && !mac ? "Ctrl" : children}
    </kbd>
  );
}
