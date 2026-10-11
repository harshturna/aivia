"use client";

import { CreditCard, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
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
        <div className="px-2 py-1.5">
          <div className="truncate text-[13px] font-medium text-fg">
            {user.name}
          </div>
          <div className="truncate text-[12px] text-mute">
            {user.isGuest ? "Shared guest session" : user.email}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onSelect={() => router.push("/settings")}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings#plan")}>
          <CreditCard /> Plan and credits
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> {user.isGuest ? "Leave the guest session" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
