import type { ContextType } from "@/constants";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user, or undefined.
 *
 * Server components and route handlers share one path now that
 * `@supabase/ssr` reads cookies the same way in both. The `context` argument
 * is kept so the many call sites need not change in this ticket; nothing
 * branches on it any more.
 */
export async function getUser(_context?: ContextType) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? undefined;
}
