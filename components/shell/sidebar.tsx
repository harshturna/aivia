"use client";

import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./account-menu";
import { SIDEBAR_COOKIE } from "./constants";
import { CreditsMeter } from "./credits-meter";
import { NAV_ITEMS } from "./nav-items";

export interface ShellUser {
  name: string;
  email: string | null;
  isGuest: boolean;
  isPro: boolean;
}
export interface ShellUsage {
  count: number;
  max: number;
}

export interface SidebarProps {
  user: ShellUser;
  usage: ShellUsage;
  /** The collapsed state the server read from the cookie, so there is no flash. */
  collapsed?: boolean;
  /** Inside the mobile sheet the rail makes no sense and the width is the sheet's. */
  inSheet?: boolean;
  onNavigate?: () => void;
}

/**
 * The sidebar (design §4): 232 px, collapsing to a 52 px rail on ⌘B or the control at its
 * foot; the state is a cookie the layout reads. Items are 32 px; no separators, groups are
 * 16 px apart. Recents arrive with the sessions ticket.
 */
export function Sidebar({
  user,
  usage,
  collapsed: initialCollapsed = false,
  inSheet = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed && !inSheet);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      return next;
    });
  }, []);

  useEffect(() => {
    if (inSheet) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, inSheet]);

  const rail = collapsed && !inSheet;

  return (
    <nav
      aria-label="Main"
      data-collapsed={rail || undefined}
      className={cn(
        "flex h-full flex-col gap-4 bg-surface py-3 text-[13px] transition-[width] duration-200 ease-sheet",
        rail ? "w-[52px] px-2" : "w-[232px] px-3",
        !inSheet && "border-r border-border"
      )}
    >
      <div
        className={cn(
          "flex h-8 items-center",
          rail ? "justify-center" : "justify-between px-2"
        )}
      >
        {!rail && (
          <Link href="/studio" onClick={onNavigate} className="rounded-control">
            <Logo className="text-[18px]" />
          </Link>
        )}
        {!inSheet && (
          <button
            type="button"
            onClick={toggle}
            aria-label={rail ? "Expand the sidebar" : "Collapse the sidebar"}
            aria-keyshortcuts="Meta+B"
            title={rail ? "Expand (⌘B)" : "Collapse (⌘B)"}
            className="grid size-7 place-items-center rounded-control text-mute transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <PanelLeft className="size-4" />
          </button>
        )}
      </div>

      <div className="space-y-0.5">
        <Item
          href="/studio"
          icon={Plus}
          rail={rail}
          onNavigate={onNavigate}
          hint={
            <>
              <Kbd>⌘</Kbd>
              <Kbd>N</Kbd>
            </>
          }
        >
          New session
        </Item>
      </div>

      <div className="space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Item
            key={item.href}
            href={item.href}
            icon={item.icon}
            rail={rail}
            onNavigate={onNavigate}
            active={
              pathname === item.match || pathname.startsWith(`${item.match}/`)
            }
          >
            {item.label}
          </Item>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        {!user.isPro && !rail && (
          <CreditsMeter count={usage.count} max={usage.max} />
        )}
        {user.isGuest && !rail && (
          <Link
            href="/signup"
            onClick={onNavigate}
            className="block rounded-control px-2 py-1.5 text-[12px] leading-4 text-mute transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Guest session. Sign up to keep your work.
          </Link>
        )}
        <AccountMenu user={user} rail={rail}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-control text-left transition-colors hover:bg-surface-2",
              rail ? "h-9 justify-center" : "h-10 px-2"
            )}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-medium text-black">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            {!rail && (
              <>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate font-medium text-fg">
                    {user.name}
                  </span>
                  <span className="block truncate text-[11.5px] text-mute">
                    {user.isGuest
                      ? "Shared session"
                      : user.isPro
                        ? "Pro plan"
                        : "Free plan"}
                  </span>
                </span>
                <ChevronDown className="size-3.5 text-mute" />
              </>
            )}
          </button>
        </AccountMenu>
      </div>
    </nav>
  );
}

function Item({
  href,
  icon: Icon,
  children,
  rail,
  active = false,
  hint,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  rail: boolean;
  active?: boolean;
  hint?: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={rail ? String(children) : undefined}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-control font-medium transition-colors duration-150",
        rail ? "justify-center" : "px-2",
        active
          ? "bg-surface-3 text-fg"
          : "text-fg-2 hover:bg-surface-2 hover:text-fg"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!rail && <span className="truncate">{children}</span>}
      {!rail && hint && <span className="ml-auto flex gap-0.5">{hint}</span>}
    </Link>
  );
}
