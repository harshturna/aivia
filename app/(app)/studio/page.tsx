import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { type ComposerMode, MODES } from "@/components/studio/modes";
import { getAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { isSessionId } from "@/lib/session-text";
import { listProjects } from "@/lib/sessions";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = { title: "Home" };

/**
 * Home (D-005, TICKET-062): a new project's composer, then the projects. The id is made here;
 * the row is created by the agent route on the first send, so an abandoned blank project
 * leaves nothing behind.
 */
export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    prompt?: string;
    mode?: string;
    /** From the landing's composer: send the prompt on arrival (TICKET-055). */
    send?: string;
    animate?: string;
    local?: string;
  }>;
}) {
  const { prompt, mode, animate, local, send } = await searchParams;
  // a guest's browser project has its own address now (TICKET-062)
  if (local && isSessionId(local)) redirect(`/p/${local}`);
  // From the library: a still to animate as the Studio opens (TICKET-039)
  const user = await getUser("SERVER_COMPONENT");
  const [still, projects] = await Promise.all([
    user && animate ? getAsset(user.id, animate) : null,
    user ? listProjects(user.id) : [],
  ]);
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
  const guest = await isGuestUser("SERVER_COMPONENT");
  const id = randomUUID();
  return (
    <StudioClient
      key={id}
      id={id}
      isNew
      isGuest={guest}
      initialPrompt={prompt ?? ""}
      sendOnArrival={send === "1" && Boolean(prompt?.trim())}
      initialAnimate={initialAnimate}
      initialMode={initialMode}
      projects={projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))}
    />
  );
}
