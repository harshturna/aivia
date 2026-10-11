import { HARD_LIMIT_COUNTS, MAX_FREE_COUNTS } from "@/constants";

/**
 * Usage, reserved up front (TICKET-042). A request reserves its cost when it arrives, in
 * conditional updates the database applies atomically, so parallel requests cannot all slip
 * under a limit and a cancelled request cannot skip its charge. The run refunds only when it
 * made nothing. Two counters on `UserApiLimit`: `count`, the free allowance (not used for Pro
 * or the guest, which reports as Pro), and `hardLimitCount`, the per-account cost cap that
 * applies to everyone and resets each UTC day (the shared guest's cap is the public demo's).
 */

type Where = {
  userId: string;
  count?: { lte?: number; gte?: number };
  hardLimitCount?: { lte?: number; gte?: number; gt?: number };
  updatedAt?: { lt: Date };
};
type Data = {
  count?: { increment: number } | { decrement: number };
  hardLimitCount?: { increment: number } | { decrement: number } | number;
};
/** The slice of Prisma this needs, so tests can hand in a fake. */
export interface UsageDb {
  userApiLimit: {
    createMany(args: {
      data: Array<{ userId: string }>;
      skipDuplicates: boolean;
    }): Promise<unknown>;
    updateMany(args: { where: Where; data: Data }): Promise<{ count: number }>;
  };
}

export type Reservation =
  | { ok: true; refund: () => Promise<void> }
  | { ok: false; reason: "limit" | "allowance" };

export function startOfUtcDay(now: Date) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export async function reserve(
  db: UsageDb,
  userId: string,
  cost: number,
  isPro: boolean,
  now = new Date()
): Promise<Reservation> {
  const rows = db.userApiLimit;
  await rows.createMany({ data: [{ userId }], skipDuplicates: true });
  // a new day clears the cost cap (the copy says "today's limit")
  await rows.updateMany({
    where: {
      userId,
      updatedAt: { lt: startOfUtcDay(now) },
      hardLimitCount: { gt: 0 },
    },
    data: { hardLimitCount: 0 },
  });
  const hard = await rows.updateMany({
    where: { userId, hardLimitCount: { lte: HARD_LIMIT_COUNTS - cost } },
    data: { hardLimitCount: { increment: cost } },
  });
  if (hard.count === 0) return { ok: false, reason: "limit" };
  const refundHard = () =>
    rows.updateMany({
      where: { userId, hardLimitCount: { gte: cost } },
      data: { hardLimitCount: { decrement: cost } },
    });
  if (!isPro) {
    const free = await rows.updateMany({
      where: { userId, count: { lte: MAX_FREE_COUNTS - cost } },
      data: { count: { increment: cost } },
    });
    if (free.count === 0) {
      await refundHard();
      return { ok: false, reason: "allowance" };
    }
  }
  let refunded = false;
  return {
    ok: true,
    refund: async () => {
      if (refunded) return;
      refunded = true;
      await refundHard();
      if (!isPro)
        await rows.updateMany({
          where: { userId, count: { gte: cost } },
          data: { count: { decrement: cost } },
        });
    },
  };
}
