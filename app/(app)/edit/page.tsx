import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EditWorkspace } from "@/components/edit/workspace";
import { getAsset } from "@/lib/assets";
import { type EditTool, isEditTool } from "@/lib/edit";
import { getUser } from "@/lib/getUser";

export const metadata: Metadata = { title: "Edit" };

/** Generated media and the site's own: the only addresses Edit takes by `?url=`. */
const EDITABLE = /^https:\/\/([a-z0-9-]+\.)*fal\.media\/|^\/landing\/[\w.-]+$/i;

/**
 * Edit (design §7). `?tool=` picks the tab; `?asset=` starts from a library image; `?url=`
 * from an image that has no asset yet, such as a guest's (TICKET-063).
 */
export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; asset?: string; url?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { tool, asset: assetId, url } = await searchParams;
  const asset = assetId ? await getAsset(user.id, assetId) : null;
  let byUrl: string | null = null;
  if (!asset && url && EDITABLE.test(url)) {
    // the site's own files go to Cloudinary as full addresses
    const h = await headers();
    byUrl = url.startsWith("/")
      ? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}${url}`
      : url;
  }
  return (
    <EditWorkspace
      initialTool={isEditTool(tool) ? (tool as EditTool) : "restore"}
      libraryImage={
        asset?.kind === "image"
          ? { url: asset.url, prompt: asset.prompt }
          : byUrl
            ? { url: byUrl, prompt: "" }
            : null
      }
    />
  );
}
