import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LibraryClient } from "@/components/library/library-client";
import { type LibraryKind, toLibraryAsset } from "@/components/library/types";
import { listAssets } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { getSession, isSessionId, projectTitle } from "@/lib/sessions";

export const metadata: Metadata = { title: "Library" };

const KINDS: LibraryKind[] = ["all", "image", "video", "audio"];

/** The library (design §6): everything made, by day, filtered by the URL. */
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    q?: string;
    fav?: string;
    project?: string;
  }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { kind: rawKind, q, fav, project: rawProject } = await searchParams;
  // one project's media, named in a chip (TICKET-062)
  const project =
    rawProject && isSessionId(rawProject)
      ? await getSession(user.id, rawProject)
      : null;
  const kind = KINDS.includes(rawKind as LibraryKind)
    ? (rawKind as LibraryKind)
    : "all";
  const { items, nextCursor } = await listAssets(user.id, {
    kind: kind === "all" ? undefined : kind,
    query: q,
    favorite: fav === "1",
    project: project?.id,
  });
  return (
    <LibraryClient
      // not keyed on the search: a new query swaps the results in place, so the field keeps
      // its focus and what is being typed (TICKET-053)
      key={`${kind}|${fav ?? ""}|${project?.id ?? ""}`}
      initialItems={items.map(toLibraryAsset)}
      initialCursor={nextCursor}
      kind={kind}
      query={q ?? ""}
      favorites={fav === "1"}
      project={
        project ? { id: project.id, title: projectTitle(project.title) } : null
      }
      readOnly={await isGuestUser("SERVER_COMPONENT")}
    />
  );
}
