import type { UIMessage } from "ai";

/** Session helpers with no database, safe for the client (TICKET-006). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The client makes session ids with `crypto.randomUUID()`; nothing else is stored. */
export function isSessionId(id: string) {
  return UUID.test(id);
}

/**
 * A title from the first brief: the brief itself, trimmed to a line. The cheap-model
 * naming (design §12) is a follow-up; a brief is a good enough name on day one.
 */
export function titleFromBrief(text: string) {
  const line = text.replace(/\s+/g, " ").trim();
  if (!line) return "New session";
  const cut = line.length > 60 ? `${line.slice(0, 57).trimEnd()}…` : line;
  return cut.charAt(0).toUpperCase() + cut.slice(1);
}

/** The text of a UIMessage, for naming and for the listing. */
export function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");
}
