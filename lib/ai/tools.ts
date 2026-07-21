import { tool } from "ai";
import { z } from "zod";

import {
  generateImages,
  generateVideo,
  generateMusic,
  generateSoundEffect,
} from "@/lib/ai/capabilities";

/**
 * The agent's toolset.
 *
 * These wrap the same capability functions the standalone routes use, so the
 * studio and the individual tool pages always behave identically.
 *
 * Descriptions are deliberately prescriptive about *when* to call each tool,
 * not just what it does. Recent Claude models reach for tools conservatively,
 * and trigger conditions in the description measurably improve call rate.
 */
export const agentTools = {
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
      const urls = await generateImages({ prompt, amount });
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
        .union([
          z.literal(6),
          z.literal(8),
          z.literal(10),
          z.literal(12),
          z.literal(14),
          z.literal(16),
          z.literal(18),
          z.literal(20),
        ])
        .default(6)
        .describe("Clip length in seconds. Prefer 6 — cost scales with this."),
    }),
    execute: async ({ prompt, durationSeconds }) => {
      const url = await generateVideo(prompt, durationSeconds);
      return { url, prompt };
    },
  }),

  generate_music: tool({
    description:
      "Generate a music track from a text description. Call this when the user " +
      "asks for music, a song, a jingle, a soundtrack or background audio — " +
      "anything with melody, instrumentation or rhythm. Do NOT use this for " +
      "sound effects such as an animal noise, an explosion, footsteps or " +
      "ambience; use generate_sound_effect for those. Describe genre, " +
      "instrumentation, tempo and mood.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe("A description of the genre, instrumentation, tempo and mood."),
      durationSeconds: z
        .number()
        .int()
        .min(5)
        .max(180)
        .default(30)
        .describe("Track length in seconds. Prefer 30 unless asked."),
    }),
    execute: async ({ prompt, durationSeconds }) => {
      const url = await generateMusic(prompt, durationSeconds);
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
        .describe("A description of the sound, e.g. 'a lion roaring nearby'."),
      durationSeconds: z
        .number()
        .min(0.5)
        .max(22)
        .optional()
        .describe("Length in seconds. Omit to let the model choose."),
    }),
    execute: async ({ prompt, durationSeconds }) => {
      const url = await generateSoundEffect(prompt, durationSeconds);
      return { url, prompt };
    },
  }),
};

export type AgentTools = typeof agentTools;
