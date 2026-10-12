import { redirect } from "next/navigation";
import { getAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";

/**
 * Edit moved into the project (D-005 §17.7, TICKET-067). An old address with a library image
 * opens that image in its project's editor; anything else goes Home.
 */
export default async function EditRedirect({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { asset: assetId } = await searchParams;
  const asset =
    assetId && /^[\w-]{1,64}$/.test(assetId)
      ? await getAsset(user.id, assetId)
      : null;
  if (asset?.kind === "image" && asset.sessionId)
    redirect(`/p/${asset.sessionId}/edit?src=${asset.id}`);
  redirect(asset ? "/library" : "/studio");
}
