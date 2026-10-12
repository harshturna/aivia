"use client";

import { Menu } from "lucide-react";
import { createContext, useContext } from "react";

/** Opens the mobile sidebar; provided by the shell. */
export const ShellMenuContext = createContext<(() => void) | null>(null);

/**
 * The menu button below 1024 px. A screen header carries it, and the shell's own bar hides
 * when one does (globals.css), so a phone shows one header, not two.
 */
export function MenuButton() {
  const open = useContext(ShellMenuContext);
  if (!open) return null;
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open the menu"
      className="-ml-1 grid size-9 pointer-coarse:size-11 shrink-0 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
    >
      <Menu className="size-5" />
    </button>
  );
}
