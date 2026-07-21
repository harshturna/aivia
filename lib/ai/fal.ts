import { fal } from "@fal-ai/client";

/**
 * Media generation goes through fal's own client rather than @ai-sdk/fal.
 *
 * Two reasons, both discovered by reading the provider rather than assuming:
 *
 * 1. @ai-sdk/fal's video model builds `queue.fal.run/fal-ai/{id}`, hardcoding
 *    the `fal-ai/` namespace. Endpoints outside it (bytedance/*, xai/*) are
 *    unreachable, and on fal the text-to-video models live there.
 * 2. The AI SDK's generateImage returns base64 GeneratedFiles, not URLs. Every
 *    client here renders a URL into <Image>/<audio>/<video>, so base64 would
 *    mean data URLs and a next/image workaround for no benefit.
 *
 * Credentials resolve from FAL_KEY automatically.
 */

/** Endpoint ids are plain strings; fal's generated union does not cover every model. */
export async function runFal<T = unknown>(
  endpointId: string,
  input: Record<string, unknown>
): Promise<T> {
  const result = await (
    fal.subscribe as unknown as (
      id: string,
      opts: { input: Record<string, unknown> }
    ) => Promise<{ data: T }>
  )(endpointId, { input });

  return result.data;
}

/**
 * fal endpoints are not consistent about how they wrap a generated asset:
 * some return `{ video: { url } }`, some `{ audio: "https://..." }`, some a
 * bare array. Rather than pin each one from documentation we cannot execute,
 * accept the common shapes and fail loudly if none match.
 */
export function extractUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.startsWith("http") ? value : null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractUrl(entry);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string") return record.url;
    for (const key of ["video", "audio", "image", "file", "output"]) {
      if (key in record) {
        const found = extractUrl(record[key]);
        if (found) return found;
      }
    }
  }

  return null;
}
