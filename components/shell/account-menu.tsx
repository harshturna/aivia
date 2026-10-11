"use client";

import { CreditCard, Keyboard, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useShortcuts } from "./command-palette";
import type { ShellUser } from "./sidebar";

/** The account menu (design §4): Settings, Plan and credits, Sign out. */
export function AccountMenu({
  user,
  rail,
  children,
}: {
  user: ShellUser;
  rail: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const showShortcuts = useShortcuts();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = user.isGuest ? "/signup" : "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={rail ? "right" : "top"}
        align={rail ? "end" : "start"}
        sideOffset={8}
        className="w-56"
      >
        {/* the button already names a guest; an account's email is worth showing */}
        {!user.isGuest && user.email && (
          <>
            <div className="truncate px-2 py-1.5 text-[12px] text-mute">
              {user.email}
            </div>
            <DropdownMenuSeparator className="bg-border" />
          </>
        )}
        <DropdownMenuItem onSelect={() => router.push("/settings")}>
          <Settings /> Settings
        </DropdownMenuItem>
        {!user.isGuest && (
          <DropdownMenuItem onSelect={() => router.push("/settings#plan")}>
            <CreditCard /> Plan and credits
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={showShortcuts} className="max-lg:hidden">
          <Keyboard /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> {user.isGuest ? "Leave the guest session" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
