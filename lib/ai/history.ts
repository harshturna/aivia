/**
 * What a conversation sends to the model (TICKET-043): the latest messages, at most 24 and
 * 120,000 characters of text, starting on a brief. A long session stays affordable and a
 * pasted novel is refused instead of billed. Attachments are not counted here; the request
 * size limit bounds them.
 */
export const MAX_HISTORY_MESSAGES = 24;
export const MAX_HISTORY_CHARS = 120_000;

type MessageLike = {
  role: string;
  parts: ReadonlyArray<{ type: string; text?: string }>;
};

function textLength(message: MessageLike) {
  let n = 0;
  for (const part of message.parts)
    if (part.type === "text" && typeof part.text === "string")
      n += part.text.length;
  return n;
}

/** The recent history to send, or null when the latest message alone is over the limit. */
export function recentHistory<T extends MessageLike>(
  messages: T[]
): T[] | null {
  const out: T[] = [];
  let chars = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const length = textLength(messages[i]);
    if (
      out.length >= MAX_HISTORY_MESSAGES ||
      chars + length > MAX_HISTORY_CHARS
    )
      break;
    out.unshift(messages[i]);
    chars += length;
  }
  if (!out.length) return null;
  // the model's side of a conversation starts with the person's
  while (out.length > 1 && out[0].role !== "user") out.shift();
  return out;
}
