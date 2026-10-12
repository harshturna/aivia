import { NextResponse } from "next/server";
import { toLibraryAsset } from "@/components/library/types";
import { deleteAsset, getAsset, getNeighbors, setFavorite } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { createClient } from "@/lib/supabase/server";
import { BUCKET, checkPath, storagePath } from "@/lib/upload-check";

type Params = { params: Promise<{ id: string }> };

/** One asset and the ones either side, for stepping through the lightbox (TICKET-057). */
export async function GET(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const asset = await getAsset(user.id, (await params).id);
  if (!asset) return new NextResponse("Not found", { status: 404 });
  const { prev, next } = await getNeighbors(user.id, asset);
  return NextResponse.json({ asset: toLibraryAsset(asset), prev, next });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { favorite } = (await req.json().catch(() => ({}))) as {
    favorite?: boolean;
  };
  if (typeof favorite !== "boolean")
    return new NextResponse("favorite must be true or false", { status: 400 });
  const count = await setFavorite(user.id, (await params).id, favorite);
  if (!count) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const id = (await params).id;
  const asset = await getAsset(user.id, id);
  const count = await deleteAsset(user.id, id);
  if (!count) return new NextResponse("Not found", { status: 404 });
  // a file we stored for this person goes with it: their own session may delete in their
  // own folder, and nothing else (TICKET-079)
  const path = asset
    ? storagePath(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", asset.url)
    : null;
  if (path && checkPath(user.id, path)) {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) console.error("[ASSET_FILE_DELETE]", error.message);
  }
  return NextResponse.json({ ok: true });
}
