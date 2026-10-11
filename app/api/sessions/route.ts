import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { listSessions } from "@/lib/sessions";

/** Recent sessions for the sidebar (design §4). */
export async function GET(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const limit = Math.min(
    50,
    Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 8)
  );
  const isGuest = await isGuestUser("ROUTE_HANDLER");
  return NextResponse.json(await listSessions(user.id, { limit, isGuest }));
}
