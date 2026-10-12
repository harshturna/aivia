import { NextResponse } from "next/server";
import { checkDoc, deleteEdit, getEdit, saveEdit } from "@/lib/edits";
import { getUser } from "@/lib/getUser";

type Params = { params: Promise<{ id: string }> };

/** One cut, whole (D-005, TICKET-064). */
export async function GET(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const edit = await getEdit(user.id, (await params).id);
  if (!edit) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(edit);
}

/**
 * Saves a cut over the `rev` the caller read. A stale rev is 409: someone (another tab) saved
 * first, and the client reloads rather than overwrite.
 */
export async function PUT(req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    rev?: unknown;
    doc?: unknown;
    title?: unknown;
  } | null;
  if (typeof body?.rev !== "number" || !Number.isInteger(body.rev))
    return new NextResponse("The rev you read is required", { status: 400 });
  let doc: Parameters<typeof saveEdit>[3]["doc"];
  if (body.doc !== undefined) {
    // an image edit is the steps behind one saved version: it is kept as it was
    const edit = await getEdit(user.id, (await params).id);
    if (edit?.kind === "image")
      return new NextResponse("An image edit is kept as it was saved", {
        status: 400,
      });
    const checked = checkDoc(body.doc);
    if (!checked.ok) return new NextResponse(checked.error, { status: 400 });
    doc = checked.doc;
  }
  const saved = await saveEdit(user.id, (await params).id, body.rev, {
    doc,
    title: typeof body.title === "string" ? body.title : undefined,
  });
  if (saved === null) return new NextResponse("Not found", { status: 404 });
  if (saved === "stale")
    return new NextResponse("Changed in another tab", { status: 409 });
  return NextResponse.json(saved);
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const count = await deleteEdit(user.id, (await params).id);
  if (!count) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}
