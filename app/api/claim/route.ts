import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  assetsFromMessages,
  claimedSessionId,
  MAX_CLAIMED_SESSIONS,
  parseClaim,
} from "@/lib/claim";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";

/**
 * Claims a guest's work kept in their browser into the account they just signed up or signed
 * in to (TICKET-041, hardened in TICKET-042). Each session gets an id derived from the account
 * and the browser id (a guest may have continued a shared example, whose id is not theirs; a
 * retry finds what it made), its title and messages, and an asset per output (https or the
 * site's own media, at most 40). Everything is written in one transaction. No generation is
 * spent.
 */
export async function POST(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (isGuestId(user.id))
    return new NextResponse("Sign up to keep your work", { status: 403 });

  const sessions = parseClaim(await req.json().catch(() => null));
  if (!sessions) return new NextResponse("Nothing to claim", { status: 400 });

  try {
    const plan = await Promise.all(
      [...sessions]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(async (s) => ({ s, id: await claimedSessionId(user.id, s.id) }))
    );
    const existing = new Set(
      (
        await prismadb.session.findMany({
          where: { id: { in: plan.map((p) => p.id) } },
          select: { id: true },
        })
      ).map((r) => r.id)
    );
    // claimed sessions are marked, and an account holds a bounded number of them
    const held = await prismadb.session.count({
      where: { userId: user.id, mode: "claimed" },
    });
    const room = Math.max(0, MAX_CLAIMED_SESSIONS - held);
    const fresh = plan.filter((p) => !existing.has(p.id)).slice(0, room);
    await prismadb.$transaction(
      fresh.flatMap(({ s, id }) => {
        const assets = assetsFromMessages(s.messages);
        return [
          prismadb.session.create({
            data: {
              id,
              userId: user.id,
              title: s.title,
              mode: "claimed",
              messages: s.messages as unknown as Prisma.InputJsonValue,
            },
          }),
          ...(assets.length
            ? [
                prismadb.asset.createMany({
                  data: assets.map((a) => ({
                    userId: user.id,
                    sessionId: id,
                    kind: a.kind,
                    url: a.url,
                    prompt: a.prompt,
                    model: "claimed",
                  })),
                }),
              ]
            : []),
        ];
      })
    );
    // newest first: the client opens ids[0]; only ids that exist now are returned
    const kept = new Set([...existing, ...fresh.map((f) => f.id)]);
    return NextResponse.json({
      ids: plan.map((p) => p.id).filter((id) => kept.has(id)),
    });
  } catch (error) {
    console.error("[CLAIM]", error);
    return new NextResponse("The work could not be kept", { status: 500 });
  }
}
