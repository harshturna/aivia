"use client";

import {
  type LocalMessage,
  type LocalSession,
  MAX_LOCAL_SESSIONS,
  MAX_SESSION_BYTES,
  sanitizeMessages,
} from "@/lib/claim";

/**
 * A guest's sessions in this browser (TICKET-041): the shared guest account stores nothing,
 * so their work lives here until they sign up, when it is claimed into their account. Every
 * access is guarded: storage can be blocked or full, and the Studio must work regardless.
 */
const KEY = "aivia:guest-sessions";
export const LOCAL_CHANGED = "aivia:local-sessions-changed";

export function listLocalSessions(): LocalSession[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as LocalSession[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getLocalSession(id: string) {
  return listLocalSessions().find((s) => s.id === id) ?? null;
}

export function saveLocalSession(session: {
  id: string;
  title: string;
  messages: LocalMessage[];
}) {
  try {
    const messages = sanitizeMessages(session.messages);
    if (!messages.length || JSON.stringify(messages).length > MAX_SESSION_BYTES)
      return;
    const next: LocalSession = {
      id: session.id,
      title: session.title,
      updatedAt: Date.now(),
      messages,
    };
    const rest = listLocalSessions().filter((s) => s.id !== session.id);
    window.localStorage.setItem(
      KEY,
      JSON.stringify([next, ...rest].slice(0, MAX_LOCAL_SESSIONS))
    );
    window.dispatchEvent(new Event(LOCAL_CHANGED));
  } catch {
    // full or blocked: the run still shows; it just is not kept here
  }
}

export function clearLocalSessions() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(LOCAL_CHANGED));
  } catch {}
}

/** After sign-in or sign-up: move this browser's guest work into the account. */
export async function claimLocalSessions(): Promise<string | null> {
  const sessions = listLocalSessions();
  if (!sessions.length) return null;
  try {
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessions }),
    });
    if (!res.ok) return null;
    const { ids } = (await res.json()) as { ids: string[] };
    clearLocalSessions();
    return ids[0] ?? null;
  } catch {
    return null;
  }
}
