import { NextResponse } from "next/server";
import { getAsset, recordAsset } from "@/lib/assets";
import { setEditOutput } from "@/lib/edits";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";
import { getSession, isSessionId } from "@/lib/sessions";
import { checkPath, MAX_KEPT, publicUrl, sniff } from "@/lib/upload-check";

/**
 * Records a file the browser put in storage as a library piece (D-005, TICKET-064): an
 * exported cut, an edited image. The address must be a file of ours in the caller's own
 * folder, and its first bytes must be what its name says. No generation is spent.
 */
export async function POST(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (isGuestId(user.id))
    return new NextResponse("Sign up to keep your work", { status: 403 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const ext = checkPath(user.id, path);
  if (!ext) return new NextResponse("Not a file of yours", { status: 400 });

  // kept files per account are bounded (TICKET-079)
  const keptCount = await prismadb.asset.count({
    where: { userId: user.id, model: { in: ["aivia/edit", "aivia/cut"] } },
  });
  if (keptCount >= MAX_KEPT)
    return new NextResponse("This account holds as many kept files as it can", {
      status: 403,
    });

  const url = publicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", path);
  const head = await fetch(url, { headers: { Range: "bytes=0-15" } })
    .then(async (r) => (r.ok ? new Uint8Array(await r.arrayBuffer()) : null))
    .catch(() => null);
  if (!head || sniff(head) !== ext)
    return new NextResponse("That file is not what its name says", {
      status: 400,
    });

  const sessionId =
    typeof body?.sessionId === "string" &&
    isSessionId(body.sessionId) &&
    (await getSession(user.id, body.sessionId))
      ? body.sessionId
      : null;
  const parent =
    typeof body?.parentAssetId === "string"
      ? await getAsset(user.id, body.parentAssetId)
      : null;
  const editId = typeof body?.editId === "string" ? body.editId : null;
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
  const video = ext === "mp4" || ext === "webm";
  const title =
    String(body?.title ?? "").slice(0, 200) || (video ? "A cut" : "An edit");

  const asset = await recordAsset({
    userId: user.id,
    sessionId: sessionId ?? parent?.sessionId ?? null,
    kind: video ? "video" : "image",
    url,
    prompt: video ? `Cut: ${title}` : title,
    model: video ? "aivia/cut" : "aivia/edit",
    params: editId ? { edit: editId } : {},
    width: num(body?.width),
    height: num(body?.height),
    durationSec: num(body?.seconds),
    parentAssetId: parent?.id ?? null,
  });
  if (editId) await setEditOutput(user.id, editId, asset.id);
  return NextResponse.json({ id: asset.id, url });
}
