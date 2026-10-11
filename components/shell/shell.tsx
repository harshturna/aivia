"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { claimLocalSessions, isClaimPending } from "@/lib/guest-local";
import { CommandPalette } from "./command-palette";
import { ShellMenuContext } from "./menu-button";
import { type ShellUsage, type ShellUser, Sidebar } from "./sidebar";

/**
 * The shell (design §4): the sidebar beside the canvas from 1024 px; below it, a header
 * with a menu button that opens the same sidebar as a sheet.
 */
export function Shell({
  user,
  usage,
  collapsed,
  children,
}: {
  user: ShellUser;
  usage: ShellUsage;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // a sign-up confirmed by email brings its guest work on the first signed-in load
  useEffect(() => {
    if (user.isGuest || !isClaimPending()) return;
    void claimLocalSessions().then((id) => {
      if (id) window.dispatchEvent(new Event("aivia:sessions-changed"));
    });
  }, [user.isGuest]);
  return (
    <ShellMenuContext.Provider value={() => setOpen(true)}>
      <CommandPalette>
        <div className="flex min-h-dvh bg-bg text-fg">
          <div className="hidden h-dvh shrink-0 lg:sticky lg:top-0 lg:block">
            <Sidebar user={user} usage={usage} collapsed={collapsed} />
          </div>
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
            <header
              data-mobile-bar
              className="flex h-13 shrink-0 items-center gap-3 border-b border-border px-3 lg:hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open the menu"
                className="grid size-9 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <Menu className="size-5" />
              </button>
              <Logo className="text-[18px]" />
            </header>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent side="left" className="w-[280px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Sidebar
                  user={user}
                  usage={usage}
                  inSheet
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <main id="main" className="min-h-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </CommandPalette>
    </ShellMenuContext.Provider>
  );
}
