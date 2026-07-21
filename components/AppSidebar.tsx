"use client";

import { cn } from "@/lib/utils";
import { Wand2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export interface SidebarRoute {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface AppSidebarProps {
  routes: SidebarRoute[];
  /** Optional cross-link back to the tool picker. */
  discoverMore?: boolean;
  children?: React.ReactNode;
}

/**
 * Shared sidebar shell.
 *
 * The generative, characters and transformations route groups each carried a
 * copy of this markup differing only in the routes array — the same
 * duplication that let the chat pages drift apart. Colours come from the
 * sidebar tokens rather than a hardcoded hex, and every focusable element has
 * a visible focus ring. Active is a filled accent pill plus a coral marker
 * bar; hover is the same accent at lower opacity (previously active and hover
 * were visually identical).
 */
export const AppSidebar = ({
  routes,
  discoverMore = false,
  children,
}: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground"
    >
      <div className="px-3 py-2 flex-1">
        <Link
          href="/dashboard"
          className="mb-10 flex items-center gap-3 pl-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Logo className="h-8 w-8 shrink-0 text-primary" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            Aivia
          </span>
        </Link>
        <ul className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-sm group relative flex w-full cursor-pointer justify-start rounded-lg p-3 font-medium transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                    />
                  )}
                  <span className="flex flex-1 items-center">
                    <route.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary" : ""
                      )}
                      aria-hidden="true"
                    />
                    {route.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {discoverMore && (
          <div className="mt-10 border-t border-sidebar-border pt-5">
            <Link
              href="/dashboard"
              className="mx-auto flex w-max items-center justify-center rounded-lg bg-sidebar-accent px-6 py-2 text-sm transition hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              Discover more tools
              <Wand2 className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
      {children}
    </nav>
  );
};
