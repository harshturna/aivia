import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { type ComposerMode, MODES } from "@/components/studio/modes";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = { title: "Studio" };

/**
 * A new session (design §5.1). The id is made here; the row is created by the agent route on
 * the first send, so an abandoned blank session leaves nothing behind.
 */
export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; mode?: string }>;
}) {
  const { prompt, mode } = await searchParams;
  const initialMode = MODES.some((m) => m.id === mode)
    ? (mode as ComposerMode)
    : "auto";
  const id = randomUUID();
  return (
    <StudioClient
      key={id}
      id={id}
      isNew
      initialPrompt={prompt ?? ""}
      initialMode={initialMode}
    />
  );
}
