"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * The browser's Supabase client, made when something needs it (sign-in,
 * sign-out). The server refreshes the session on every request through the
 * proxy, so the browser does not also refresh: two refreshers racing over one
 * refresh token is how a tab comes back from the background signed out.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, detectSessionInUrl: false } }
  );
}
