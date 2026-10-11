import { tool } from "ai";
import { z } from "zod";

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
import { keepAsset } from "@/lib/assets";

/**
 * The agent's toolset, built per request so each tool knows whose session it is writing
 * to. Every result is recorded as an Asset inside the tool itself (design §12): the row
 * exists even if the client abandons the stream before the run finishes.
 *
 * Descriptions are deliberately prescriptive about *when* to call each tool, not just
 * what it does; trigger conditions in the description measurably improve call rate.
 */
export interface ToolContext {
  userId: string;
  sessionId: string | null;
}

/**
 * A run is charged as one generation, so it may make at most this many pieces (TICKET-042).
 * Whether a run should cost per piece is the owner's call; this cap keeps one brief from
 * spending dollars meanwhile.
 */
export const MAX_RUN_OUTPUTS = 6;

export function createAgentTools({ userId, sessionId }: ToolContext) {
  let made = 0;
  const spend = (pieces: number) => {
    if (made + pieces > MAX_RUN_OUTPUTS)
      throw new Error(
        `One brief can make up to ${MAX_RUN_OUTPUTS} pieces. Send another brief for more.`
      );
    made += pieces;
  };
  return {
    generate_image: tool({
      description:
        "Generate one or more images from a text description. Call this whenever " +
        "the user asks for a picture, logo, illustration, artwork, mockup, icon, " +
        "poster, or any other visual. Write a vivid, detailed prompt describing " +
        "subject, style, composition and lighting rather than passing the user's " +
        "words through verbatim.",
      inputSchema: z.object({
        prompt: z
          .string()
          .describe("A detailed visual description of the image to generate."),
        amount: z
          .number()
          .int()
          .min(1)
          .max(4)
          .default(1)
          .describe("How many variations to generate. Prefer 1 unless asked."),
      }),
      execute: async ({ prompt, amount }) => {
        spend(amount);
        const urls = await generateImages({ prompt, amount });
        await Promise.all(
          urls.map((url) =>
            keepAsset({
              userId,
              sessionId,
              kind: "image",
              url,
              prompt,
              model: IMAGE_MODEL,
              params: { amount },
            })
          )
        );
        return { urls, prompt };
      },
    }),

    generate_video: tool({
      description:
        "Generate a short video clip from a text description. Call this when the " +
        "user asks for a video, clip, animation, or motion sequence. This is slow " +
        "(tens of seconds) and by far the most expensive tool, so do not call it " +
        "speculatively and keep clips short unless a longer one is asked for.",
      inputSchema: z.object({
        prompt: z
          .string()
          .describe("A detailed description of the scene, motion and camera."),
        durationSeconds: z
          // the same lengths as Video mode; longer clips cost more than a run is charged
          .union([z.literal(6), z.literal(8), z.literal(10)])
          .default(6)
          .describe("Clip length in seconds. Prefer 6; cost scales with this."),
      }),
      execute: async ({ prompt, durationSeconds }) => {
        spend(1);
        const url = await generateVideo(prompt, durationSeconds);
        await keepAsset({
          userId,
          sessionId,
          kind: "video",
          url,
          prompt,
          model: VIDEO_MODEL,
          params: { durationSeconds },
          durationSec: durationSeconds,
        });
        return { url, prompt };
      },
    }),

    generate_music: tool({
      description:
        "Generate a music track from a text description. Call this when the user " +
        "asks for music, a song, a jingle, a soundtrack or background audio, " +
        "anything with melody, instrumentation or rhythm. Do NOT use this for " +
        "sound effects such as an animal noise, an explosion, footsteps or " +
        "ambience; use generate_sound_effect for those. Describe genre, " +
        "instrumentation, tempo and mood.",
      inputSchema: z.object({
        prompt: z
          .string()
          .describe(
            "A description of the genre, instrumentation, tempo and mood."
          ),
        durationSeconds: z
          .number()
          .int()
          .min(5)
          .max(180)
          .default(30)
          .describe("Track length in seconds. Prefer 30 unless asked."),
      }),
      execute: async ({ prompt, durationSeconds }) => {
        spend(1);
        const url = await generateMusic(prompt, durationSeconds);
        await keepAsset({
          userId,
          sessionId,
          kind: "music",
          url,
          prompt,
          model: MUSIC_MODEL,
          params: { durationSeconds },
          durationSec: durationSeconds,
        });
        return { url, prompt };
      },
    }),

    generate_sound_effect: tool({
      description:
        "Generate a non-musical sound effect from a text description. Call this " +
        "for animal noises, weather, impacts, footsteps, machinery, ambience, UI " +
        "sounds, or any real-world noise. Use this rather than generate_music " +
        "whenever the request has no melody or instrumentation.",
      inputSchema: z.object({
        prompt: z
          .string()
          .describe(
            "A description of the sound, e.g. 'a lion roaring nearby'."
          ),
        durationSeconds: z
          .number()
          .min(0.5)
          .max(22)
          .optional()
          .describe("Length in seconds. Omit to let the model choose."),
      }),
      execute: async ({ prompt, durationSeconds }) => {
        spend(1);
        const url = await generateSoundEffect(prompt, durationSeconds);
        await keepAsset({
          userId,
          sessionId,
          kind: "sound",
          url,
          prompt,
          model: SFX_MODEL,
          params: { durationSeconds },
          durationSec: durationSeconds ?? null,
        });
        return { url, prompt };
      },
    }),
  };
}

export type AgentTools = ReturnType<typeof createAgentTools>;
