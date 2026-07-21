import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getUser } from "@/lib/getUser";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkHardLimit, increaseHardLimit } from "@/lib/hard-limit";
import { checkSubscription } from "@/lib/subscription";
import { ContextType } from "@/constants";

type GuardDenied = { ok: false; response: NextResponse };

type GuardAllowed = {
  ok: true;
  user: User;
  isPro: boolean;
  /**
   * Record usage against both counters. Call this only after the generation
   * actually succeeded, so failed requests don't burn a user's quota.
   */
  consume: () => Promise<void>;
};

export type GuardResult = GuardDenied | GuardAllowed;

/**
 * Single entry point for the auth + quota checks every generation route needs.
 *
 * Replaces the block that was duplicated across the conversation, code, image,
 * music, video and chat routes. Two behavioural notes:
 *
 * - The three checks run concurrently. Previously they ran in sequence and each
 *   one re-fetched the Supabase session internally, so a request paid four
 *   round-trips before doing any work.
 * - The hard limit is a cost cap and applies to everyone, including "Pro". The
 *   guest account is shared by every visitor and `checkSubscription` reports it
 *   as Pro, so exempting Pro here would uncap public spend. See constants.ts.
 */
export async function guardGeneration(
  context: ContextType = "ROUTE_HANDLER"
): Promise<GuardResult> {
  const user = await getUser(context);

  if (!user) {
    return {
      ok: false,
      response: new NextResponse("Unauthorized", { status: 401 }),
    };
  }

  const [withinFreeTrial, isPro, withinHardLimit] = await Promise.all([
    checkApiLimit(context),
    checkSubscription(context),
    checkHardLimit(context),
  ]);

  if (!withinHardLimit) {
    return {
      ok: false,
      response: new NextResponse(
        "Demo generation limit reached. Please try again later.",
        { status: 429 }
      ),
    };
  }

  // 403 is what the client maps to the upgrade modal.
  if (!withinFreeTrial && !isPro) {
    return {
      ok: false,
      response: new NextResponse("Free trial has expired", { status: 403 }),
    };
  }

  return {
    ok: true,
    user,
    isPro,
    consume: async () => {
      await Promise.all([
        isPro ? Promise.resolve() : increaseApiLimit(context),
        increaseHardLimit(context),
      ]);
    },
  };
}
