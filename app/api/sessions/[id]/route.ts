import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { deleteSession, getSession, renameSession } from "@/lib/sessions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const session = await getSession(user.id, (await params).id);
  if (!session) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { title } = (await req.json().catch(() => ({}))) as { title?: string };
  if (typeof title !== "string" || !title.trim())
    return new NextResponse("A title is required", { status: 400 });
  const count = await renameSession(user.id, (await params).id, title);
  if (!count) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const count = await deleteSession(user.id, (await params).id);
  if (!count) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}
