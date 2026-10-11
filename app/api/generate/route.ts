import { randomUUID } from "node:crypto";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import {
  generateImages,
  generateMusic,
  generateSoundEffect,
  generateVideo,
  IMAGE_MODEL,
  MUSIC_MODEL,
  SFX_MODEL,
  VIDEO_MODEL,
} from "@/lib/ai/capabilities";
import {
  ASPECT_SIZES,
  costOf,
  DirectRequest,
  TOOL_FOR_MODE,
} from "@/lib/ai/direct";
import { guardGeneration } from "@/lib/ai/guard";
import { recordAsset } from "@/lib/assets";
import {
  ensureSession,
  isSessionId,
  messageText,
  renameSession,
  saveMessages,
  titleFromBrief,
} from "@/lib/sessions";

// A video can take a couple of minutes.
export const maxDuration = 300;

/**
 * Direct modes (design §5.4): the brief goes straight to one capability, no planner. The
 * result streams back as a tool part so the Studio renders it with the same components as
 * an Auto run, and the session and the asset are saved the same way.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      messages?: UIMessage[];
      mode?: unknown;
      params?: unknown;
    };
    const messages = body.messages ?? [];
    const parsed = DirectRequest.safeParse({
      mode: body.mode,
      params: body.params,
    });
    const last = messages[messages.length - 1];
    const prompt = last?.role === "user" ? messageText(last).trim() : "";
    if (!parsed.success || !prompt) {
      return new Response("A mode and a description are required", {
        status: 400,
      });
    }
    const request = parsed.data;
    const cost = costOf(request);

    const guard = await guardGeneration("ROUTE_HANDLER", cost);
    if (!guard.ok) return guard.response;
    const userId = guard.user.id;

    const sessionId = body.id && isSessionId(body.id) ? body.id : null;
    if (sessionId) {
      const session = await ensureSession(userId, sessionId, request.mode);
      if (session.title === "New session")
        await renameSession(userId, sessionId, titleFromBrief(prompt));
    }

    let succeeded = false;
    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const toolCallId = randomUUID();
        const toolName = TOOL_FOR_MODE[request.mode];
        const { params } = request;
        const input =
          request.mode === "image"
            ? { prompt, amount: params.count, aspect: params.aspect }
            : request.mode === "video"
              ? { prompt, durationSeconds: params.videoSeconds }
              : request.mode === "music"
                ? { prompt, durationSeconds: params.musicSeconds }
                : { prompt, durationSeconds: params.soundSeconds || undefined };

        writer.write({ type: "start" });
        writer.write({ type: "start-step" });
        writer.write({
          type: "tool-input-available",
          toolCallId,
          toolName,
          input,
        });
        try {
          const output = await run(request, prompt, userId, sessionId);
          writer.write({ type: "tool-output-available", toolCallId, output });
          succeeded = true;
        } catch (error) {
          console.error("[GENERATE_ERROR]", error);
          writer.write({
            type: "tool-output-error",
            toolCallId,
            errorText: error instanceof Error ? error.message : String(error),
          });
        }
        writer.write({ type: "finish-step" });
        writer.write({ type: "finish" });
      },
      onFinish: async ({ messages: all }) => {
        // Only a result is charged: a direct request that failed made nothing.
        if (succeeded) await guard.consume();
        if (sessionId) {
          try {
            await saveMessages(userId, sessionId, all);
          } catch (error) {
            console.error("[GENERATE_SAVE]", error);
          }
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[GENERATE]", error);
    return new Response("Internal error", { status: 500 });
  }
}

async function run(
  { mode, params }: DirectRequest,
  prompt: string,
  userId: string,
  sessionId: string | null
) {
  if (mode === "image") {
    const size = ASPECT_SIZES[params.aspect];
    const urls = await generateImages({
      prompt,
      amount: params.count,
      ...size,
    });
    await Promise.all(
      urls.map((url) =>
        recordAsset({
          userId,
          sessionId,
          kind: "image",
          url,
          prompt,
          model: IMAGE_MODEL,
          params: { aspect: params.aspect, count: params.count },
          ...size,
        })
      )
    );
    return { urls, prompt, aspect: params.aspect };
  }
  if (mode === "video") {
    const url = await generateVideo(prompt, params.videoSeconds);
    await recordAsset({
      userId,
      sessionId,
      kind: "video",
      url,
      prompt,
      model: VIDEO_MODEL,
      params: { durationSeconds: params.videoSeconds },
      durationSec: params.videoSeconds,
    });
    return { url, prompt };
  }
  if (mode === "music") {
    const url = await generateMusic(prompt, params.musicSeconds);
    await recordAsset({
      userId,
      sessionId,
      kind: "music",
      url,
      prompt,
      model: MUSIC_MODEL,
      params: { durationSeconds: params.musicSeconds },
      durationSec: params.musicSeconds,
    });
    return { url, prompt };
  }
  const seconds = params.soundSeconds || undefined;
  const url = await generateSoundEffect(prompt, seconds);
  await recordAsset({
    userId,
    sessionId,
    kind: "sound",
    url,
    prompt,
    model: SFX_MODEL,
    params: { durationSeconds: seconds ?? null },
    durationSec: seconds ?? null,
  });
  return { url, prompt };
}
