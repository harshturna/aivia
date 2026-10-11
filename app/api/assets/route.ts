import { NextResponse } from "next/server";
import { type AssetKind, listAssets } from "@/lib/assets";
import { getUser } from "@/lib/getUser";

const KINDS = new Set(["image", "video", "music", "sound", "audio"]);

/** Everything the user made, newest first, by cursor (design §6, §12). */
export async function GET(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const q = new URL(req.url).searchParams;
  const kind = q.get("kind");
  return NextResponse.json(
    await listAssets(user.id, {
      kind: kind && KINDS.has(kind) ? (kind as AssetKind | "audio") : undefined,
      query: q.get("q") ?? undefined,
      favorite: q.get("fav") === "1",
      project: q.get("project") ?? undefined,
      cursor: q.get("cursor"),
    })
  );
}
