import { describe, expect, it } from "vitest";
import { HARD_LIMIT_COUNTS, MAX_FREE_COUNTS } from "@/constants";
import { reserve, type UsageDb } from "./usage";

/** An in-memory UserApiLimit with the conditional updateMany semantics Postgres gives. */
function fakeDb(
  start: { count?: number; hard?: number; updatedAt?: Date } = {}
) {
  const row = {
    userId: "u",
    count: start.count ?? 0,
    hardLimitCount: start.hard ?? 0,
    updatedAt: start.updatedAt ?? new Date(),
  };
  let exists = start.count !== undefined || start.hard !== undefined;
  const matches = (w: Record<string, unknown>) =>
    Object.entries(w).every(([k, cond]) => {
      if (k === "userId") return cond === row.userId;
      const v = row[k as keyof typeof row] as number | Date;
      const c = cond as Record<string, number | Date>;
      if (c.lte !== undefined && !(v <= c.lte)) return false;
      if (c.gte !== undefined && !(v >= c.gte)) return false;
      if (c.gt !== undefined && !(v > c.gt)) return false;
      if (c.lt !== undefined && !(v < c.lt)) return false;
      return true;
    });
  const db: UsageDb = {
    userApiLimit: {
      async createMany() {
        exists = true;
      },
      async updateMany({ where, data }) {
        if (!exists || !matches(where as never)) return { count: 0 };
        for (const [k, op] of Object.entries(data)) {
          const key = k as "count" | "hardLimitCount";
          if (typeof op === "number") row[key] = op;
          else if ("increment" in op) row[key] += op.increment;
          else row[key] -= op.decrement;
        }
        row.updatedAt = new Date();
        return { count: 1 };
      },
    },
  };
  return { db, row };
}

describe("reserve", () => {
  it("charges the free allowance and the cap up front, and refunds once", async () => {
    const { db, row } = fakeDb();
    const r = await reserve(db, "u", 2, false);
    expect(r.ok).toBe(true);
    expect([row.count, row.hardLimitCount]).toEqual([2, 2]);
    if (r.ok) {
      await r.refund();
      await r.refund();
    }
    expect([row.count, row.hardLimitCount]).toEqual([0, 0]);
  });

  it("refuses past the free allowance without touching the cap", async () => {
    const { db, row } = fakeDb({ count: MAX_FREE_COUNTS - 1, hard: 10 });
    const r = await reserve(db, "u", 4, false);
    expect(r).toEqual({ ok: false, reason: "allowance" });
    expect(row.hardLimitCount).toBe(10);
  });

  it("counts the request's cost against the cap, for Pro too", async () => {
    const { db } = fakeDb({ hard: HARD_LIMIT_COUNTS - 3 });
    expect(await reserve(db, "u", 4, true)).toEqual({
      ok: false,
      reason: "limit",
    });
    expect((await reserve(db, "u", 3, true)).ok).toBe(true);
  });

  it("lets only as many parallel requests through as fit", async () => {
    const { db, row } = fakeDb({ count: 0 });
    const results = await Promise.all(
      Array.from({ length: 20 }, () => reserve(db, "u", 1, false))
    );
    expect(results.filter((r) => r.ok)).toHaveLength(MAX_FREE_COUNTS);
    expect(row.count).toBe(MAX_FREE_COUNTS);
  });

  it("clears the cap on a new UTC day", async () => {
    const yesterday = new Date(Date.now() - 36 * 60 * 60 * 1000);
    const { db, row } = fakeDb({
      hard: HARD_LIMIT_COUNTS,
      updatedAt: yesterday,
    });
    expect((await reserve(db, "u", 1, true)).ok).toBe(true);
    expect(row.hardLimitCount).toBe(1);
  });
});
