import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { type ComposerMode, MODES } from "@/components/studio/modes";
import { getAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { isSessionId } from "@/lib/session-text";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = { title: "Studio" };

/**
 * A new session (design §5.1). The id is made here; the row is created by the agent route on
 * the first send, so an abandoned blank session leaves nothing behind.
 */
export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    prompt?: string;
    mode?: string;
    animate?: string;
    local?: string;
  }>;
}) {
  const { prompt, mode, animate, local } = await searchParams;
  // From the library: a still to animate as the Studio opens (TICKET-039)
  const user = animate ? await getUser("SERVER_COMPONENT") : null;
  const still = user && animate ? await getAsset(user.id, animate) : null;
  const initialAnimate =
    still?.kind === "image"
      ? {
          url: still.url,
          prompt: still.prompt,
          width: still.width ?? 1,
          height: still.height ?? 1,
        }
      : undefined;
  const initialMode = MODES.some((m) => m.id === mode)
    ? (mode as ComposerMode)
    : "auto";
  // a guest session kept in this browser reopens under its own id (TICKET-041); only the
  // guest has one, so a stale link after sign-in starts a fresh session (TICKET-042)
  const guest = await isGuestUser("SERVER_COMPONENT");
  const localId = guest && local && isSessionId(local) ? local : undefined;
  const id = localId ?? randomUUID();
  return (
    <StudioClient
      key={id}
      id={id}
      isNew
      isGuest={guest}
      initialPrompt={prompt ?? ""}
      initialAnimate={initialAnimate}
      localId={localId}
      initialMode={initialMode}
    />
  );
}
