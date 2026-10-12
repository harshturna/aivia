import type { ComposerMode } from "@/components/studio/composer";
import type { ModeParams } from "@/components/studio/params";

/**
 * How one piece is made again (TICKET-051, TICKET-068): the direct mode and parameters that
 * repeat it. A piece from a direct run repeats that run as it was sent, with an Animate's still;
 * a piece an Auto run planned repeats its own tool call in that tool's mode. Always one piece.
 */
type PartLike = {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  mediaType?: string;
  url?: string;
  text?: string;
};
type MessageLike = {
  id: string;
  role: string;
  parts: PartLike[];
  metadata?: unknown;
};

export type PieceRequest = {
  prompt: string;
  mode: Exclude<ComposerMode, "auto">;
  params: Partial<ModeParams>;
};

/** The direct mode and parameters that make one piece of a run again. */
export function pieceRequest(part: PartLike): PieceRequest {
  const input = (part.input ?? {}) as {
    prompt?: string;
    amount?: number;
    aspect?: string;
    seconds?: number;
  };
  const nearest = <T extends number>(options: readonly T[], value?: number) =>
    value === undefined
      ? undefined
      : options.reduce((a, b) =>
          Math.abs(b - value) < Math.abs(a - value) ? b : a
        );
  const output = part.output as { prompt?: string } | undefined;
  const prompt = output?.prompt ?? input.prompt ?? "";
  const params: Partial<ModeParams> = {};
  let mode: PieceRequest["mode"];
  switch (part.type) {
    case "tool-generate_image":
      mode = "image";
      params.count = (nearest([1, 2, 3, 4] as const, input.amount) ??
        1) as ModeParams["count"];
      if (input.aspect) params.aspect = input.aspect as ModeParams["aspect"];
      break;
    case "tool-generate_video":
      mode = "video";
      if (input.aspect)
        params.videoAspect = input.aspect as ModeParams["videoAspect"];
      break;
    case "tool-generate_music":
      mode = "music";
      params.musicSeconds = nearest([15, 30, 60] as const, input.seconds) ?? 30;
      break;
    default:
      mode = "sound";
      params.soundSeconds = nearest([0, 2, 5, 10] as const, input.seconds) ?? 0;
  }
  return { prompt, mode, params };
}

export type TakeRequest = PieceRequest & {
  scene?: string;
  /** An Animate's still, sent again with the brief. */
  files: Array<{ type: "file"; mediaType: string; url: string }>;
};

const urlsOf = (part: PartLike) => {
  const out = part.output as { url?: string; urls?: string[] } | undefined;
  return out?.urls ?? (out?.url ? [out.url] : []);
};

/**
 * The request that makes the piece at this address again, or null if no run here made it.
 * With the piece's size, a run that did not name its shape keeps the piece's, never the
 * composer's current choice.
 */
export function takeFor(
  messages: MessageLike[],
  url: string,
  size?: { width: number; height: number }
): TakeRequest | null {
  const req = requestFor(messages, url);
  if (!req || !size?.width || !size.height) return req;
  if (req.mode === "image" && !req.params.aspect)
    return {
      ...req,
      params: { ...req.params, aspect: nearestAspect(size, IMAGE_ASPECTS) },
    };
  if (req.mode === "video" && !req.files.length && !req.params.videoAspect)
    return {
      ...req,
      params: {
        ...req.params,
        videoAspect: nearestAspect(size, VIDEO_ASPECTS),
      },
    };
  return req;
}

/** The shape nearest a piece's own size. */
export function nearestAspect<T extends string>(
  size: { width: number; height: number },
  options: readonly T[]
): T {
  const r = Math.log(size.width / size.height);
  const ratio = (a: string) => {
    const [w, h] = a.split(":").map(Number);
    return Math.log(w / h);
  };
  return options.reduce((a, b) =>
    Math.abs(ratio(b) - r) < Math.abs(ratio(a) - r) ? b : a
  );
}
const IMAGE_ASPECTS = ["1:1", "3:4", "4:3", "16:9", "9:16"] as const;
const VIDEO_ASPECTS = ["16:9", "9:16", "1:1"] as const;

function requestFor(messages: MessageLike[], url: string): TakeRequest | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const answer = messages[i];
    if (answer.role !== "assistant") continue;
    const part = answer.parts.find(
      (p) =>
        p.type.startsWith("tool-generate_") &&
        p.state === "output-available" &&
        urlsOf(p).includes(url)
    );
    if (!part) continue;
    const brief = messages[i - 1]?.role === "user" ? messages[i - 1] : null;
    const sent = brief?.metadata as
      | { mode?: ComposerMode; params?: Partial<ModeParams>; scene?: string }
      | undefined;
    const piece = pieceRequest(part);
    const text = (brief?.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    // a direct run, repeated as it was sent: its words, its parameters, its still
    if (brief && sent?.mode && sent.mode !== "auto" && sent.mode === piece.mode)
      return {
        prompt: text || piece.prompt,
        mode: piece.mode,
        params: {
          ...sent.params,
          ...(piece.mode === "image" ? { count: 1 } : {}),
        },
        ...(sent.scene ? { scene: sent.scene } : {}),
        files: brief.parts
          .filter(
            (p) =>
              p.type === "file" &&
              p.mediaType?.startsWith("image/") &&
              p.url &&
              !p.url.startsWith("data:")
          )
          .map((p) => ({
            type: "file" as const,
            mediaType: p.mediaType as string,
            url: p.url as string,
          })),
      };
    // a piece an Auto run planned: its own tool call, in its mode
    if (!piece.prompt) return null;
    return {
      ...piece,
      params: {
        ...piece.params,
        ...(piece.mode === "image" ? { count: 1 } : {}),
      },
      files: [],
    };
  }
  return null;
}
