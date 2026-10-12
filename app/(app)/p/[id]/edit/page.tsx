import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ImageEditor } from "@/components/editor/image-editor";
import { getAsset, listVersions } from "@/lib/assets";
import { getEdit } from "@/lib/edits";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { type ImageEdit, imageEditSchema } from "@/lib/image-edit/schema";
import { isEditableUrl } from "@/lib/image-edit/sources";
import { versionItems } from "@/lib/media";
import { getSession, isSessionId, projectTitle } from "@/lib/sessions";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ src?: string }>;
};

export const metadata: Metadata = { title: "Edit" };

/**
 * The image editor in a project (D-005 §17.7, TICKET-067). `?src=` is a library piece's id (a
 * saved version reopens with its steps) or the address of one of the project's pictures that
 * has no asset yet, such as a guest's. Anything else goes back to the project.
 */
export default async function EditPage({ params, searchParams }: Params) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { id } = await params;
  const { src = "" } = await searchParams;
  if (!isSessionId(id)) notFound();
  const isGuest = await isGuestUser("SERVER_COMPONENT");
  const session = await getSession(user.id, id);
  if (!session && !isGuest) notFound();

  let source: { url: string; assetId?: string; prompt: string } | null = null;
  let initialDoc: ImageEdit | null = null;
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const editable = (u: string) => isEditableUrl(u, storage, origin);
  if (/^[\w-]{1,64}$/.test(src)) {
    const asset = await getAsset(user.id, src);
    if (asset?.kind === "image" && editable(asset.url)) {
      source = { url: asset.url, assetId: asset.id, prompt: asset.prompt };
      // a saved version opens on its steps, so it can be changed rather than redone
      const editId = (asset.params as { edit?: unknown } | null)?.edit;
      if (asset.model === "aivia/edit" && typeof editId === "string") {
        const edit = await getEdit(user.id, editId);
        const parsed =
          edit?.kind === "image" ? imageEditSchema.safeParse(edit.doc) : null;
        if (parsed?.success && editable(parsed.data.source.url)) {
          initialDoc = parsed.data;
          const parent = parsed.data.source.assetId
            ? await getAsset(user.id, parsed.data.source.assetId)
            : null;
          source = {
            url: parsed.data.source.url,
            assetId: parsed.data.source.assetId,
            prompt: parent?.prompt ?? asset.prompt,
          };
        }
      }
    }
  } else if (editable(src)) {
    // the site's own pictures stay relative: the doc then saves from any origin (TICKET-080),
    // and the AI tools make them absolute when they copy them
    source = { url: src, prompt: "" };
  }
  if (!source) redirect(`/p/${id}`);

  const versions = session ? versionItems(await listVersions(user.id, id)) : [];
  return (
    <ImageEditor
      key={`${id}:${src}`}
      projectId={id}
      title={session ? projectTitle(session.title) : "Project"}
      isGuest={isGuest}
      initialMessages={session ? (session.messages as never) : null}
      versions={versions}
      source={source}
      initialDoc={initialDoc}
    />
  );
}
