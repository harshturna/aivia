import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Keeps the session fresh. Next 16 calls this file proxy.ts; it was middleware.ts. */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Everything but static assets, image optimisation, the icon, the landing media,
    // the Stripe webhook (a signature, not a session) and the cron (a secret).
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|api/webhook|api/housekeeping|landing/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
