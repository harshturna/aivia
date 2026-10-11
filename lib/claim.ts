/**
 * A guest's work, kept in their own browser and claimed into their account when they sign
 * up or sign in (TICKET-041, hardened in TICKET-042). Pure, so both sides share it and it is
 * tested here. Input arrives from a browser, so every message and part is checked.
 */
import { isSessionId } from "@/lib/session-text";

type Part = {
  type: string;
  state?: string;
  url?: string;
  mediaType?: string;
  output?: { url?: unknown; urls?: unknown; prompt?: unknown };
};
export type LocalMessage = {
  id: string;
  role: string;
  parts: Part[];
  /** What the brief was sent with (mode, parameters), for Retry (TICKET-043). */
  metadata?: Record<string, unknown>;
};
export type LocalSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: LocalMessage[];
};

export const MAX_LOCAL_SESSIONS = 5;
/** Claimed sessions one account may hold: a few browsers' worth, not a loop (TICKET-046). */
export const MAX_CLAIMED_SESSIONS = 20;
/** Per session, as JSON: a few runs of URLs and text are far under this. */
export const MAX_SESSION_BYTES = 400_000;
/** Outputs kept per claimed session, and the longest address accepted. */
export const MAX_CLAIM_ASSETS = 40;
const MAX_URL = 2048;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A pasted attachment is a data URL, megabytes of it; the browser copy keeps the rest. */
export function sanitizeMessages(messages: unknown): LocalMessage[] {
  if (!Array.isArray(messages)) return [];
  const out: LocalMessage[] = [];
  for (const m of messages) {
    if (!isObject(m) || !Array.isArray(m.parts)) continue;
    if (m.role !== "user" && m.role !== "assistant") continue;
    const parts = (m.parts as unknown[]).filter(
      (p): p is Part =>
        isObject(p) &&
        typeof p.type === "string" &&
        !(
          p.type === "file" &&
          typeof p.url === "string" &&
          p.url.startsWith("data:")
        )
    );
    const metadata =
      isObject(m.metadata) && JSON.stringify(m.metadata).length < 2000
        ? m.metadata
        : undefined;
    out.push({
      id: String(m.id),
      role: m.role,
      parts,
      ...(metadata ? { metadata } : {}),
    });
  }
  return out;
}

const SAFE_URL = /^(https:\/\/|\/landing\/)/;
const KIND: Record<string, "image" | "video" | "music" | "sound"> = {
  generate_image: "image",
  generate_video: "video",
  generate_music: "music",
  generate_sound_effect: "sound",
};

/** The outputs a session shows, as library assets: kind, address, the prompt that made it. */
export function assetsFromMessages(messages: LocalMessage[]) {
  const out: Array<{
    kind: (typeof KIND)[string];
    url: string;
    prompt: string;
  }> = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const p of m.parts) {
      if (!p.type.startsWith("tool-") || p.state !== "output-available")
        continue;
      const kind = KIND[p.type.slice(5)];
      if (!kind) continue;
      const o = isObject(p.output) ? p.output : {};
      const urls = Array.isArray(o.urls) ? o.urls : [o.url];
      for (const url of urls) {
        if (out.length >= MAX_CLAIM_ASSETS) return out;
        if (
          typeof url === "string" &&
          url.length <= MAX_URL &&
          SAFE_URL.test(url)
        )
          out.push({
            kind,
            url,
            prompt: String(o.prompt ?? "").slice(0, 2000),
          });
      }
    }
  }
  return out;
}

/** A claim as the server accepts it, or null: a few sessions, real ids, a size cap. */
export function parseClaim(body: unknown): LocalSession[] | null {
  const list = isObject(body) ? body.sessions : null;
  if (!Array.isArray(list) || list.length === 0) return null;
  const out: LocalSession[] = [];
  for (const raw of list.slice(0, MAX_LOCAL_SESSIONS)) {
    if (!isObject(raw)) continue;
    if (typeof raw.id !== "string" || !isSessionId(raw.id)) continue;
    const messages = sanitizeMessages(raw.messages);
    if (messages.length === 0) continue;
    if (JSON.stringify(messages).length > MAX_SESSION_BYTES) continue;
    out.push({
      id: raw.id,
      title:
        String(raw.title ?? "")
          .trim()
          .slice(0, 80) || "A guest session",
      updatedAt: Number(raw.updatedAt) || Date.now(),
      messages,
    });
  }
  return out.length ? out : null;
}

/**
 * The account's id for a claimed session: derived from the account and the browser's id, so a
 * retried claim finds the session it already made instead of duplicating it. It is a valid
 * uuid, distinct from the browser id (a guest may have continued a shared example).
 */
export async function claimedSessionId(userId: string, localId: string) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`aivia-claim:${userId}:${localId}`)
    )
  ).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
