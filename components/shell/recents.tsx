"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LOCAL_CHANGED, listLocalSessions } from "@/lib/guest-local";
import { cn } from "@/lib/utils";

/** Must match `SESSIONS_CHANGED` in the Studio client. */
const SESSIONS_CHANGED = "aivia:sessions-changed";

type Recent = { id: string; title: string };

/**
 * Recent sessions in the sidebar (design §4). Loaded on mount and whenever a run ends;
 * nothing renders until there is something to show.
 */
export function Recents({
  onNavigate,
  isGuest = false,
}: {
  onNavigate?: () => void;
  /** A guest also sees the sessions kept in this browser (TICKET-041). */
  isGuest?: boolean;
}) {
  const pathname = usePathname();
  const [items, setItems] = useState<Recent[] | null>(null);
  const [local, setLocal] = useState<Recent[]>([]);
  useEffect(() => {
    if (!isGuest) return;
    const read = () =>
      setLocal(listLocalSessions().map((s) => ({ id: s.id, title: s.title })));
    read();
    window.addEventListener(LOCAL_CHANGED, read);
    return () => window.removeEventListener(LOCAL_CHANGED, read);
  }, [isGuest]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions?limit=8");
      if (response.ok) setItems((await response.json()) as Recent[]);
    } catch {
      // the list is a convenience; a failed load leaves it as it was
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(SESSIONS_CHANGED, load);
    return () => window.removeEventListener(SESSIONS_CHANGED, load);
  }, [load]);

  if (!items?.length && !local.length) return null;

  return (
    <div className="min-h-0">
      {local.length > 0 && (
        <>
          <div className="px-2 pb-1 text-[12px] text-mute">On this device</div>
          <ul className="mb-3 space-y-0.5">
            {local.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/studio?local=${item.id}`}
                  onClick={onNavigate}
                  className="flex h-8 items-center rounded-control px-2 text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
                >
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {(items?.length ?? 0) > 0 && (
        <div className="px-2 pb-1 text-[12px] text-mute">
          {isGuest ? "Examples" : "Recent"}
        </div>
      )}
      <ul className="space-y-0.5">
        {(items ?? []).map((item) => {
          const href = `/studio/${item.id}`;
          const active = pathname === href;
          return (
            <li key={item.id}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center rounded-control px-2 transition-colors duration-150",
                  active
                    ? "bg-surface-3 text-fg"
                    : "text-fg-2 hover:bg-surface-2 hover:text-fg"
                )}
              >
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
