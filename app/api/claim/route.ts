import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { assetsFromMessages, parseClaim } from "@/lib/claim";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";

/**
 * Claims a guest's work kept in their browser into the account they just signed up or signed
 * in to (TICKET-041). Each session gets a fresh id (a guest may have continued a shared
 * example, whose id is not theirs), its title and messages, and an asset per output the run
 * shows. Only https or the site's own media are accepted as outputs. No generation is spent.
 */
export async function POST(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (isGuestId(user.id))
    return new NextResponse("Sign up to keep your work", { status: 403 });

  const sessions = parseClaim(await req.json().catch(() => null));
  if (!sessions) return new NextResponse("Nothing to claim", { status: 400 });

  // newest first in, newest first out: the client opens ids[0]
  const ids: string[] = [];
  for (const s of [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const id = randomUUID();
    await prismadb.session.create({
      data: {
        id,
        userId: user.id,
        title: s.title,
        messages: s.messages as unknown as Prisma.InputJsonValue,
      },
    });
    const assets = assetsFromMessages(s.messages);
    if (assets.length)
      await prismadb.asset.createMany({
        data: assets.map((a) => ({
          userId: user.id,
          sessionId: id,
          kind: a.kind,
          url: a.url,
          prompt: a.prompt,
          model: "claimed",
        })),
      });
    ids.push(id);
  }
  return NextResponse.json({ ids });
}
