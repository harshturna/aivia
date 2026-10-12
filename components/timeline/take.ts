import {
  parseJsonEventStream,
  readUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
  uiMessageChunkSchema,
} from "ai";
import type { TakeRequest } from "@/components/studio/piece-request";

/**
 * A new take (D-005 §17.5, TICKET-068): the piece made again as a run of the project, through
 * the same direct route and guard as every run in Make, read here from its stream. Signed in,
 * the route saves the run with the project; the caller keeps the guest's copy.
 */
export type TakeResult =
  | { ok: true; url: string; messages: UIMessage[] }
  | { ok: false; limit?: "free" | "guest"; message: string };

export async function makeTake(
  projectId: string,
  messages: UIMessage[],
  request: TakeRequest
): Promise<TakeResult> {
  const brief: UIMessage = {
    id: crypto.randomUUID(),
    role: "user",
    metadata: {
      mode: request.mode,
      params: request.params,
      ...(request.scene ? { scene: request.scene } : {}),
    },
    parts: [{ type: "text", text: request.prompt }, ...request.files],
  };
  const all = [...messages, brief];
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: projectId,
      messages: all,
      mode: request.mode,
      params: request.params,
      scene: request.scene,
    }),
  }).catch(() => null);
  if (!res) return { ok: false, message: "The connection dropped. Try again." };
  if (res.status === 429) return { ok: false, limit: "guest", message: "" };
  if (res.status === 403) return { ok: false, limit: "free", message: "" };
  if (res.status === 401)
    return {
      ok: false,
      message: "You were signed out. Reload the page to keep going.",
    };
  if (!res.ok || !res.body)
    return { ok: false, message: "The take did not start. Try again." };

  const chunks = parseJsonEventStream({
    stream: res.body,
    schema: uiMessageChunkSchema,
  }).pipeThrough(
    new TransformStream<{ success: boolean; value?: unknown }, UIMessageChunk>({
      transform(result, controller) {
        if (result.success) controller.enqueue(result.value as UIMessageChunk);
      },
    })
  );
  let answer: UIMessage | undefined;
  try {
    for await (const message of readUIMessageStream({ stream: chunks }))
      answer = message;
  } catch {
    return {
      ok: false,
      message: "The take stopped before it finished. Try again.",
    };
  }
  const part = answer?.parts.find((p) => p.type.startsWith("tool-generate_")) as
    | { state?: string; output?: { url?: string; urls?: string[] } }
    | undefined;
  const url = part?.output?.url ?? part?.output?.urls?.[0];
  if (!answer || part?.state !== "output-available" || !url)
    return {
      ok: false,
      message: "The take did not come back, so it cost nothing. Try again.",
    };
  return {
    ok: true,
    url,
    messages: [...all, { ...answer, id: answer.id || crypto.randomUUID() }],
  };
}
