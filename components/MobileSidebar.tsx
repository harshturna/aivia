"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

/**
 * The previous version nested a <Menu> icon inside a <MenuIcon> component
 * (invalid children inside an svg — the inner icon never rendered), had no
 * accessible name, and hid itself behind an isMounted guard that made the
 * hamburger pop in after hydration on every page load. None of that was
 * necessary: Sheet is client-safe to server-render closed.
 */
const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: MobileSidebarProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="p-0">
      <Sidebar apiLimitCount={apiLimitCount} isPro={isPro} />
    </SheetContent>
  </Sheet>
);

export default MobileSidebar;
