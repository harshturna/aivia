"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MenuButton } from "./menu-button";

/**
 * A screen's header (design §4): 52 px, the title at 15 px 500 on the left, the screen's
 * actions on the right. Solid, so media scrolling under it does not show through, with a
 * hairline only once the content has scrolled beneath it (TICKET-052). The body is the canvas.
 */
export function ScreenHeader({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      data-screen-header
      className={cn(
        "sticky top-0 z-10 flex h-13 shrink-0 items-center gap-3 border-b bg-bg px-3 text-[15px] font-medium transition-colors duration-150 lg:px-6",
        scrolled ? "border-border" : "border-transparent",
        className
      )}
    >
      <MenuButton />
      <h1 className="truncate text-[15px] font-medium">{title}</h1>
      {children && (
        <div className="ml-auto flex items-center gap-2 text-[13px] font-normal text-fg-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function ScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}
