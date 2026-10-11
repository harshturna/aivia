/**
 * A guest's work, kept in their own browser and claimed into their account when they sign
 * up or sign in (TICKET-041). Pure, so both sides share it and it is tested here.
 */
import { isSessionId } from "@/lib/session-text";

type Part = {
  type: string;
  state?: string;
  url?: string;
  mediaType?: string;
  output?: { url?: string; urls?: string[]; prompt?: string };
};
export type LocalMessage = { id: string; role: string; parts: Part[] };
export type LocalSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: LocalMessage[];
};

export const MAX_LOCAL_SESSIONS = 5;
/** Per session, as JSON: a few runs of URLs and text are far under this. */
export const MAX_SESSION_BYTES = 400_000;

/** A pasted attachment is a data URL, megabytes of it; the browser copy keeps the rest. */
export function sanitizeMessages(messages: LocalMessage[]): LocalMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: String(m.id),
      role: m.role,
      parts: (m.parts ?? []).filter(
        (p) => !(p.type === "file" && p.url?.startsWith("data:"))
      ),
    }));
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
    for (const p of m.parts ?? []) {
      if (!p.type?.startsWith("tool-") || p.state !== "output-available")
        continue;
      const kind = KIND[p.type.slice(5)];
      if (!kind) continue;
      const urls = p.output?.urls ?? (p.output?.url ? [p.output.url] : []);
      for (const url of urls)
        if (typeof url === "string" && SAFE_URL.test(url))
          out.push({
            kind,
            url,
            prompt: String(p.output?.prompt ?? "").slice(0, 2000),
          });
    }
  }
  return out;
}

/** A claim as the server accepts it, or null: a few sessions, real ids, a size cap. */
export function parseClaim(body: unknown): LocalSession[] | null {
  const list = (body as { sessions?: unknown })?.sessions;
  if (!Array.isArray(list) || list.length === 0) return null;
  const out: LocalSession[] = [];
  for (const raw of list.slice(0, MAX_LOCAL_SESSIONS)) {
    const s = raw as Partial<LocalSession>;
    if (typeof s?.id !== "string" || !isSessionId(s.id)) continue;
    if (!Array.isArray(s.messages) || s.messages.length === 0) continue;
    const messages = sanitizeMessages(s.messages as LocalMessage[]);
    if (JSON.stringify(messages).length > MAX_SESSION_BYTES) continue;
    out.push({
      id: s.id,
      title:
        String(s.title ?? "")
          .trim()
          .slice(0, 80) || "A guest session",
      updatedAt: Number(s.updatedAt) || Date.now(),
      messages,
    });
  }
  return out.length ? out : null;
}
