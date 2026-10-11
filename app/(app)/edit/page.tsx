import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditWorkspace } from "@/components/edit/workspace";
import { getAsset } from "@/lib/assets";
import { type EditTool, isEditTool } from "@/lib/edit";
import { getUser } from "@/lib/getUser";

export const metadata: Metadata = { title: "Edit" };

/** Edit (design §7). `?tool=` picks the tab; `?asset=` starts from a library image. */
export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; asset?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { tool, asset: assetId } = await searchParams;
  const asset = assetId ? await getAsset(user.id, assetId) : null;
  return (
    <EditWorkspace
      initialTool={isEditTool(tool) ? (tool as EditTool) : "restore"}
      libraryImage={
        asset?.kind === "image"
          ? { url: asset.url, prompt: asset.prompt }
          : null
      }
    />
  );
}
