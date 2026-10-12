"use client";

import { Clapperboard, LayoutGrid, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A project's tabs on a phone (D-005 §17.4, TICKET-076): Make, Media, Cut at the foot of the
 * screen, where a thumb is. Make shows them below 640 px; Cut, which is a storyboard below
 * 1024, shows them below 1024.
 */
export function ProjectTabs({
  projectId,
  view,
  onMedia,
  below,
}: {
  projectId: string;
  view: "make" | "cut";
  onMedia: () => void;
  below: "sm" | "lg";
}) {
  const item =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors";
  return (
    <nav
      aria-label="Project"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]",
        below === "sm" ? "sm:hidden" : "lg:hidden"
      )}
    >
      <Link
        href={`/p/${projectId}`}
        aria-current={view === "make" ? "page" : undefined}
        className={cn(item, view === "make" ? "text-fg" : "text-mute")}
      >
        <MessageSquare className="size-5" /> Make
      </Link>
      <button type="button" onClick={onMedia} className={cn(item, "text-mute")}>
        <LayoutGrid className="size-5" /> Media
      </button>
      <Link
        href={`/p/${projectId}/cut`}
        aria-current={view === "cut" ? "page" : undefined}
        className={cn(item, view === "cut" ? "text-fg" : "text-mute")}
      >
        <Clapperboard className="size-5" /> Cut
      </Link>
    </nav>
  );
}

/** Room at the foot of a view for the tabs above. */
export const TABS_ROOM = "pb-[calc(3.5rem+env(safe-area-inset-bottom))]";
