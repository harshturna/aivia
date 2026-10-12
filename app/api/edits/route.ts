import { NextResponse } from "next/server";
import { checkDoc, createEdit, listEdits } from "@/lib/edits";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";
import { getSession, isSessionId } from "@/lib/sessions";

/** A project's cuts (D-005, TICKET-064). */
export async function GET(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const project = new URL(req.url).searchParams.get("project") ?? "";
  if (!isSessionId(project))
    return new NextResponse("A project is required", { status: 400 });
  return NextResponse.json(await listEdits(user.id, project));
}

/** A new cut, on a project the caller owns (or on none). The guest keeps cuts in the browser. */
export async function POST(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (isGuestId(user.id))
    return new NextResponse("Sign up to keep your work", { status: 403 });
  const body = (await req.json().catch(() => null)) as {
    projectId?: unknown;
    title?: unknown;
    doc?: unknown;
  } | null;
  const checked = checkDoc(body?.doc);
  if (!checked.ok) return new NextResponse(checked.error, { status: 400 });
  const projectId =
    typeof body?.projectId === "string" &&
    isSessionId(body.projectId) &&
    (await getSession(user.id, body.projectId))
      ? body.projectId
      : null;
  const edit = await createEdit(user.id, {
    projectId,
    title: typeof body?.title === "string" ? body.title : undefined,
    doc: checked.doc,
  });
  return NextResponse.json(edit, { status: 201 });
}
