import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { ContextType } from "@/constants";
import { getUser } from "@/lib/getUser";
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { reserve } from "@/lib/usage";

type GuardDenied = { ok: false; response: NextResponse };

type GuardAllowed = {
  ok: true;
  user: User;
  isPro: boolean;
  /**
   * The cost was reserved when the guard passed (TICKET-042). Call this only when the request
   * made nothing (a failed direct run, an error before streaming), so a failure does not burn
   * the allowance. A cancelled request keeps its charge: the work still runs and is billed.
   */
  refund: () => Promise<void>;
};

export type GuardResult = GuardDenied | GuardAllowed;

/**
 * Single entry point for the auth and quota checks every generation route needs. It reserves
 * the request's cost atomically up front (`lib/usage.ts`): parallel requests cannot all slip
 * under a limit, and a client that disconnects cannot skip the charge. The hard limit is a
 * daily cost cap and applies to everyone, including "Pro": the guest account is shared by
 * every visitor and `checkSubscription` reports it as Pro, so exempting Pro would uncap public
 * spend. See constants.ts.
 */
export async function guardGeneration(
  context: ContextType = "ROUTE_HANDLER",
  /** Generations this request will spend (four images are four). */
  cost = 1
): Promise<GuardResult> {
  const user = await getUser(context);
  if (!user) {
    return {
      ok: false,
      response: new NextResponse("Unauthorized", { status: 401 }),
    };
  }
  const isPro = await checkSubscription(context);
  const reservation = await reserve(prismadb, user.id, cost, isPro);
  if (!reservation.ok && reservation.reason === "limit") {
    return {
      ok: false,
      response: new NextResponse(
        "Demo generation limit reached. Please try again later.",
        { status: 429 }
      ),
    };
  }
  // 403 is what the client maps to the upgrade modal.
  if (!reservation.ok) {
    return {
      ok: false,
      response: new NextResponse("Free trial has expired", { status: 403 }),
    };
  }
  return { ok: true, user, isPro, refund: reservation.refund };
}
