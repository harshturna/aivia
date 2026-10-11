import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * The server's Supabase client, for server components and route handlers.
 *
 * `cookies()` is async in Next 15+; a server component cannot write cookies,
 * so the set is wrapped and the proxy (proxy.ts) is what refreshes a session.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a server component: the proxy refreshes the session.
          }
        },
      },
    }
  );
}
