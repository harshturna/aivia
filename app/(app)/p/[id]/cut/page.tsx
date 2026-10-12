import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CutView } from "@/components/timeline/cut-view";
import { getEdit, listEdits } from "@/lib/edits";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { getSession, isSessionId, projectTitle } from "@/lib/sessions";
import { migrate } from "@/lib/timeline/migrate";
import type { TimelineDoc } from "@/lib/timeline/schema";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
};

export const metadata: Metadata = { title: "Cut" };

/**
 * A project's cut (D-005 §17.5, TICKET-065): its latest cut, or the way to start one. The
 * guest's cuts, and a guest's own projects, live in the browser: the view reads them there.
 */
export default async function CutPage({ params, searchParams }: Params) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { id } = await params;
  const { run } = await searchParams;
  if (!isSessionId(id)) notFound();
  const isGuest = await isGuestUser("SERVER_COMPONENT");
  const session = await getSession(user.id, id);
  if (!session && !isGuest) notFound();

  let saved: { id: string; rev: number; doc: TimelineDoc } | null = null;
  if (session && !isGuest) {
    const [latest] = (await listEdits(user.id, id)).filter(
      (e) => e.kind === "timeline"
    );
    const edit = latest ? await getEdit(user.id, latest.id) : null;
    const loaded = edit ? migrate(edit.doc) : null;
    if (edit && loaded?.ok && loaded.doc)
      saved = { id: edit.id, rev: edit.rev, doc: loaded.doc };
  }

  return (
    <CutView
      key={id}
      projectId={id}
      title={session ? projectTitle(session.title) : "Project"}
      isGuest={isGuest}
      initialMessages={session ? (session.messages as never) : null}
      saved={saved}
      run={run && /^[\w-]{1,64}$/.test(run) ? run : null}
    />
  );
}
