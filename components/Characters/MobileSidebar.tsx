"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Sidebar from "./Sidebar";

const MobileSidebar = () => (
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
      <Sidebar />
    </SheetContent>
  </Sheet>
);

export default MobileSidebar;
