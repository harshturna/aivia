import { tool } from "ai";
import { z } from "zod";

import {
  generateImages,
  generateVideo,
  generateMusic,
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
      "(tens of seconds), so do not call it speculatively.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe("A detailed description of the scene, motion and camera."),
    }),
    execute: async ({ prompt }) => {
      const url = await generateVideo(prompt);
      return { url, prompt };
    },
  }),

  generate_music: tool({
    description:
      "Generate a music track from a text description. Call this when the user " +
      "asks for music, a song, a jingle, a soundtrack or background audio. " +
      "Describe genre, instrumentation, tempo and mood.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe("A description of the genre, instrumentation, tempo and mood."),
    }),
    execute: async ({ prompt }) => {
      const url = await generateMusic(prompt);
      return { url, prompt };
    },
  }),
};

export type AgentTools = typeof agentTools;
