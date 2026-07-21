import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Signs the visitor in to the shared demo account.
 *
 * The credentials used to live in three client components as literals, which
 * meant they shipped in the JS bundle: anyone could read them and sign in to
 * that account directly against Supabase — an account that lib/subscription.ts
 * reports as Pro unconditionally. They are now server-side only, and the
 * browser just asks for a session.
 *
 * Requires GUEST_EMAIL and GUEST_PASSWORD in the environment.
 */
export async function POST() {
  const email = process.env.GUEST_EMAIL;
  const password = process.env.GUEST_PASSWORD;

  if (!email || !password) {
    console.error("[GUEST_AUTH] GUEST_EMAIL / GUEST_PASSWORD are not set");
    return new NextResponse("Guest access is not configured", { status: 503 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[GUEST_AUTH]", error.message);
    return new NextResponse("Could not start a guest session", { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
