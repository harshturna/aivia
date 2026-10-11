import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Lightbox } from "@/components/library/lightbox";
import { toLibraryAsset } from "@/components/library/types";
import { getAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";

export const metadata: Metadata = { title: "Library" };

/** An asset opened directly (a shared link, a reload): the same view as a page. */
export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const asset = await getAsset(user.id, (await params).id);
  if (!asset) notFound();
  return (
    <Lightbox
      asset={toLibraryAsset(asset)}
      readOnly={await isGuestUser("SERVER_COMPONENT")}
    />
  );
}
