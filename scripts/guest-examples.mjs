// Writes the guest's curated examples (TICKET-038) as pinned sessions on the shared guest
// account, with their assets, from lib/guest-examples.json. Idempotent: fixed ids, assets
// replaced. Run from the project root: `node --env-file=.env scripts/guest-examples.mjs`.
// The first example in the file shows first in Recents.

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const guest = process.env.GUEST_USER_ID;
if (!guest) throw new Error("GUEST_USER_ID is not set");
const examples = JSON.parse(readFileSync("lib/guest-examples.json", "utf8"));
const db = new PrismaClient();

// written last-first so the first example is the most recently updated
for (const e of [...examples].reverse()) {
  await db.session.upsert({
    where: { id: e.id },
    create: {
      id: e.id,
      userId: guest,
      title: e.title,
      mode: e.mode,
      messages: e.messages,
      pinned: true,
    },
    update: {
      title: e.title,
      mode: e.mode,
      messages: e.messages,
      pinned: true,
    },
  });
  await db.asset.deleteMany({ where: { sessionId: e.id } });
  await db.asset.createMany({
    data: e.assets.map((a) => ({
      userId: guest,
      sessionId: e.id,
      kind: a.kind,
      url: a.url,
      posterUrl: a.posterUrl ?? null,
      prompt: a.prompt,
      model: a.model,
      width: a.width ?? null,
      height: a.height ?? null,
      durationSec: a.durationSec ?? null,
    })),
  });
  console.log("example", e.title, e.assets.length, "assets");
}
await db.$disconnect();
