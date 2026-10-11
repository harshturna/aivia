import { notFound, redirect } from "next/navigation";
import { Lightbox } from "@/components/library/lightbox";
import { toLibraryAsset } from "@/components/library/types";
import { getAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";

/** An asset opened from the library: the lightbox over the grid, at a shareable URL. */
export default async function AssetModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const asset = await getAsset(user.id, (await params).id);
  if (!asset) notFound();
  return <Lightbox asset={toLibraryAsset(asset)} modal />;
}
