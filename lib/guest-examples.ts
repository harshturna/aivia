import type { UIMessage } from "ai";
import data from "./guest-examples.json";

/**
 * The guest's curated examples (TICKET-038): the shared guest account stores nothing, so its
 * Recents and library show these instead. Built from the landing's own media in
 * public/landing; `scripts/guest-examples.mjs` writes them as pinned guest sessions with
 * their assets, idempotently, under these fixed ids.
 */
export type GuestExampleAsset = {
  kind: "image" | "video" | "music" | "sound";
  url: string;
  posterUrl?: string;
  prompt: string;
  model: string;
  width?: number;
  height?: number;
  durationSec?: number;
};

export type GuestExample = {
  id: string;
  title: string;
  mode: string;
  messages: UIMessage[];
  assets: GuestExampleAsset[];
};

export const GUEST_EXAMPLES = data as unknown as GuestExample[];
