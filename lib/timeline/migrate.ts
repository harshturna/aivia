import { TIMELINE_VERSION, type TimelineDoc, timelineSchema } from "./schema";

/**
 * Every saved cut is read through here, on the server and in the browser (TICKET-061). Older
 * versions are brought forward step by step (none yet: v1 is the first); a cut written by
 * newer code than this opens read-only rather than being reshaped and saved back wrong.
 */
export type Loaded =
  | { ok: true; doc: TimelineDoc; readOnly: false }
  | { ok: true; doc: null; readOnly: true; version: number }
  | { ok: false; error: string };

export function migrate(raw: unknown): Loaded {
  const version =
    raw && typeof raw === "object" && "version" in raw
      ? Number((raw as { version: unknown }).version)
      : Number.NaN;
  if (Number.isFinite(version) && version > TIMELINE_VERSION)
    return { ok: true, doc: null, readOnly: true, version };
  const parsed = timelineSchema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Not a cut" };
  return { ok: true, doc: parsed.data, readOnly: false };
}
