import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

/**
 * Daily cleanup of the shared guest account (design §12, TICKET-038). The guest stores nothing
 * new, so this removes whatever is left: every session that is not a pinned example, every
 * asset outside a pinned example, every character message. Called by Vercel Cron with
 * CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const guest = process.env.GUEST_USER_ID;
  if (!guest) return NextResponse.json({ skipped: "no GUEST_USER_ID" });

  const [assets, sessions, messages] = await prismadb.$transaction([
    prismadb.asset.deleteMany({
      where: {
        userId: guest,
        OR: [{ sessionId: null }, { session: { pinned: false } }],
      },
    }),
    prismadb.session.deleteMany({ where: { userId: guest, pinned: false } }),
    prismadb.message.deleteMany({ where: { userId: guest } }),
  ]);
  return NextResponse.json({
    assets: assets.count,
    sessions: sessions.count,
    messages: messages.count,
  });
}
