import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Daily cleanup of the shared guest account (design §12): sessions and assets older than a
 * week go, except a pinned example session. Called by Vercel Cron with CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const guest = process.env.GUEST_USER_ID;
  if (!guest) return NextResponse.json({ skipped: "no GUEST_USER_ID" });

  const before = new Date(Date.now() - WEEK_MS);
  const [assets, sessions] = await prismadb.$transaction([
    prismadb.asset.deleteMany({
      where: { userId: guest, createdAt: { lt: before } },
    }),
    prismadb.session.deleteMany({
      where: { userId: guest, pinned: false, updatedAt: { lt: before } },
    }),
  ]);
  return NextResponse.json({ assets: assets.count, sessions: sessions.count });
}
