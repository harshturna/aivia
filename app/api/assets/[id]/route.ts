import { NextResponse } from "next/server";
import { deleteAsset, setFavorite } from "@/lib/assets";
import { getUser } from "@/lib/getUser";

type Params = { params: Promise<{ id: string }> };

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
  const count = await deleteAsset(user.id, (await params).id);
  if (!count) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}
