import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { listVersions } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { versionItems } from "@/lib/media";
import { getSession, isSessionId, projectTitle } from "@/lib/sessions";
import { StudioClient } from "../../studio/studio-client";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await getUser("SERVER_COMPONENT");
  const { id } = await params;
  if (!user || !isSessionId(id)) return { title: "Project" };
  const session = await getSession(user.id, id);
  return { title: session ? projectTitle(session.title) : "Project" };
}

/**
 * A project (D-005, TICKET-062): a saved one, resumed where it was left. The guest's own
 * projects live in this browser, so for the guest an id that is not a pinned example opens
 * the browser's copy (TICKET-041).
 */
export default async function ProjectPage({ params }: Params) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { id } = await params;
  if (!isSessionId(id)) notFound();
  const isGuest = await isGuestUser("SERVER_COMPONENT");
  const session = await getSession(user.id, id);
  // the media tray stays as it was left (TICKET-063)
  const trayOpen = (await cookies()).get("aivia_tray")?.value !== "closed";
  if (session)
    return (
      <StudioClient
        key={session.id}
        id={session.id}
        isNew={false}
        isGuest={isGuest}
        initialMessages={session.messages}
        initialTitle={projectTitle(session.title)}
        trayOpen={trayOpen}
        versions={versionItems(await listVersions(user.id, session.id))}
      />
    );
  if (!isGuest) notFound();
  return (
    <StudioClient
      key={id}
      id={id}
      isNew
      isGuest
      localId={id}
      trayOpen={trayOpen}
    />
  );
}
