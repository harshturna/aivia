import type { UIMessage } from "ai";

/**
 * What a conversation sends to the model (TICKET-043, rebuilt in TICKET-046). The history
 * arrives from the browser, so it is rebuilt to what the model may see, then capped:
 *
 * - a brief keeps its text and attachments; a pasted (data URL) file only on the latest
 *   brief, at most 8 MB of them;
 * - a reply keeps its text and its finished media calls, with input and output cut to their
 *   real shape (addresses and a prompt);
 * - reasoning, approvals, provider-run search parts and unfinished calls are dropped. A forged
 *   approval would otherwise run a tool before the model is asked, and an unfinished call
 *   (a stopped run) would fail every later request.
 *
 * Then the latest messages, at most 24 and 120,000 characters as JSON (pasted files aside),
 * starting on a brief. Null when the latest brief alone is over the limit.
 */
export const MAX_HISTORY_MESSAGES = 24;
export const MAX_HISTORY_CHARS = 120_000;
export const MAX_PASTED_BYTES = 8 * 1024 * 1024;
const MAX_PROMPT = 2000;
const MAX_URL = 2048;

const MEDIA_TOOLS = new Set([
  "tool-generate_image",
  "tool-generate_video",
  "tool-generate_music",
  "tool-generate_sound_effect",
]);

type Part = UIMessage["parts"][number];
type Loose = Record<string, unknown>;

const isObject = (v: unknown): v is Loose =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max) : undefined;
const url = (v: unknown) =>
  typeof v === "string" &&
  v.length <= MAX_URL &&
  /^(https:\/\/|\/landing\/)/.test(v)
    ? v
    : undefined;

/** A finished media call, cut to the fields the tools really take and return. */
function mediaCall(part: Loose): Part | null {
  if (part.state !== "output-available" || typeof part.toolCallId !== "string")
    return null;
  const input = isObject(part.input) ? part.input : {};
  const output = isObject(part.output) ? part.output : {};
  const urls = Array.isArray(output.urls)
    ? output.urls
        .map(url)
        .filter((u): u is string => Boolean(u))
        .slice(0, 4)
    : undefined;
  return {
    type: part.type,
    toolCallId: part.toolCallId.slice(0, 100),
    state: "output-available",
    input: {
      prompt: text(input.prompt, MAX_PROMPT) ?? "",
      ...(typeof input.aspect === "string"
        ? { aspect: input.aspect.slice(0, 8) }
        : {}),
      ...(typeof input.amount === "number" ? { amount: input.amount } : {}),
    },
    output: {
      ...(url(output.url) ? { url: url(output.url) } : {}),
      ...(urls ? { urls } : {}),
      prompt: text(output.prompt, MAX_PROMPT) ?? "",
    },
  } as Part;
}

/** One message as the model may see it, or null when nothing of it is left. */
function clean(message: UIMessage, latest: boolean): UIMessage | null {
  if (message.role !== "user" && message.role !== "assistant") return null;
  const parts: Part[] = [];
  for (const raw of Array.isArray(message.parts) ? message.parts : []) {
    const part = raw as unknown as Loose;
    if (part.type === "text" && typeof part.text === "string") {
      parts.push({ type: "text", text: part.text });
    } else if (part.type === "step-start" && message.role === "assistant") {
      parts.push({ type: "step-start" });
    } else if (
      part.type === "file" &&
      message.role === "user" &&
      typeof part.url === "string" &&
      typeof part.mediaType === "string"
    ) {
      const pasted = part.url.startsWith("data:");
      if (pasted ? latest : url(part.url))
        parts.push({
          type: "file",
          url: part.url,
          mediaType: part.mediaType,
          ...(typeof part.filename === "string"
            ? { filename: part.filename.slice(0, 200) }
            : {}),
        });
    } else if (
      message.role === "assistant" &&
      typeof part.type === "string" &&
      MEDIA_TOOLS.has(part.type)
    ) {
      const call = mediaCall(part);
      if (call) parts.push(call);
    }
  }
  return parts.length
    ? { id: String(message.id).slice(0, 100), role: message.role, parts }
    : null;
}

function size(message: UIMessage) {
  let n = 0;
  for (const part of message.parts) {
    const p = part as unknown as Loose;
    n +=
      p.type === "file" &&
      typeof p.url === "string" &&
      p.url.startsWith("data:")
        ? 64
        : JSON.stringify(p).length;
  }
  return n;
}

function pastedBytes(message: UIMessage) {
  let n = 0;
  for (const part of message.parts) {
    const p = part as unknown as Loose;
    if (
      p.type === "file" &&
      typeof p.url === "string" &&
      p.url.startsWith("data:")
    )
      n += Math.ceil((p.url.length - p.url.indexOf(",") - 1) * 0.75);
  }
  return n;
}

/** The rebuilt, capped history to send, or null when the latest brief alone is too much. */
export function modelHistory(messages: unknown): UIMessage[] | null {
  if (!Array.isArray(messages) || !messages.length) return null;
  const last = messages.length - 1;
  const cleaned = (messages as UIMessage[])
    .map((m, i) => (isObject(m) ? clean(m, i === last) : null))
    .filter((m): m is UIMessage => m !== null);
  const latest = cleaned.at(-1);
  if (
    !latest ||
    latest.role !== "user" ||
    pastedBytes(latest) > MAX_PASTED_BYTES
  )
    return null;

  const out: UIMessage[] = [];
  let chars = 0;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const length = size(cleaned[i]);
    if (
      out.length >= MAX_HISTORY_MESSAGES ||
      chars + length > MAX_HISTORY_CHARS
    )
      break;
    out.unshift(cleaned[i]);
    chars += length;
  }
  if (!out.length) return null;
  // the model's side of a conversation starts with the person's
  while (out.length > 1 && out[0].role !== "user") out.shift();
  return out;
}
