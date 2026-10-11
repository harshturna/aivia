import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LibraryClient } from "@/components/library/library-client";
import { type LibraryKind, toLibraryAsset } from "@/components/library/types";
import { listAssets } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";

export const metadata: Metadata = { title: "Library" };

const KINDS: LibraryKind[] = ["all", "image", "video", "audio"];

/** The library (design §6): everything made, by day, filtered by the URL. */
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; q?: string; fav?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { kind: rawKind, q, fav } = await searchParams;
  const kind = KINDS.includes(rawKind as LibraryKind)
    ? (rawKind as LibraryKind)
    : "all";
  const { items, nextCursor } = await listAssets(user.id, {
    kind: kind === "all" ? undefined : kind,
    query: q,
    favorite: fav === "1",
  });
  return (
    <LibraryClient
      // not keyed on the search: a new query swaps the results in place, so the field keeps
      // its focus and what is being typed (TICKET-053)
      key={`${kind}|${fav ?? ""}`}
      initialItems={items.map(toLibraryAsset)}
      initialCursor={nextCursor}
      kind={kind}
      query={q ?? ""}
      favorites={fav === "1"}
      readOnly={await isGuestUser("SERVER_COMPONENT")}
    />
  );
}
