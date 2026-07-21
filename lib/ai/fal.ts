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

/**
 * fal's ApiError carries the useful part in `body`, not `message` — a 422
 * surfaces as "Unprocessable Entity" with the failing field buried in
 * `body.detail`. Pull it out so the thrown error says what actually broke.
 */
function describeFalError(endpointId: string, error: unknown): string {
  const err = error as {
    message?: string;
    status?: number;
    body?: { detail?: unknown };
  };

  const status = err?.status ? ` (HTTP ${err.status})` : "";
  let detail = "";

  const raw = err?.body?.detail;
  if (typeof raw === "string") {
    detail = raw;
  } else if (Array.isArray(raw)) {
    // Validation errors arrive as [{ loc: [...], msg, type }]
    detail = raw
      .map((item) => {
        const entry = item as { loc?: unknown[]; msg?: string };
        const field = Array.isArray(entry.loc) ? entry.loc.join(".") : "";
        return field ? `${field}: ${entry.msg}` : entry.msg;
      })
      .filter(Boolean)
      .join("; ");
  } else if (raw) {
    detail = JSON.stringify(raw);
  }

  return `fal ${endpointId} failed${status}: ${
    detail || err?.message || "unknown error"
  }`;
}

/** Endpoint ids are plain strings; fal's generated union does not cover every model. */
export async function runFal<T = unknown>(
  endpointId: string,
  input: Record<string, unknown>
): Promise<T> {
  try {
    const result = await (
      fal.subscribe as unknown as (
        id: string,
        opts: { input: Record<string, unknown> }
      ) => Promise<{ data: T }>
    )(endpointId, { input });

    return result.data;
  } catch (error) {
    // Without this the failure reaches the caller as an opaque object, the
    // route masks it to "An error occurred", and the model invents a reason
    // for the failure rather than reporting it.
    const described = describeFalError(endpointId, error);
    console.error("[FAL_ERROR]", described, { input });
    throw new Error(described);
  }
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
    // `audio_file` is Cassette's wrapper; without it a perfectly successful
    // response reads as "returned no audio".
    for (const key of [
      "video",
      "audio",
      "audio_file",
      "audio_url",
      "image",
      "file",
      "output",
    ]) {
      if (key in record) {
        const found = extractUrl(record[key]);
        if (found) return found;
      }
    }
  }

  return null;
}
