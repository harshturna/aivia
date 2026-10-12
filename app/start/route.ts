import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { createClient } from "@/lib/supabase/server";

/**
 * The landing's way into the Studio, in one navigation (TICKET-083): the guest's session is made
 * here on the server and the browser goes straight on to the Studio, so the only thing between
 * the landing and the Studio is the Studio's own loading state. A prompt typed on the landing
 * rides along. A failed start goes to /get-started, which says so with a retry.
 */
export async function GET(req: Request) {
  const from = new URL(req.url).searchParams;
  const next = new URLSearchParams();
  const prompt = from.get("prompt");
  const mode = from.get("mode");
  if (prompt) next.set("prompt", prompt);
  if (mode) next.set("mode", mode);
  if (prompt && from.get("send") === "1") next.set("send", "1");
  const query = next.toString();
  const studio = new URL(`/studio${query ? `?${query}` : ""}`, req.url);

  if (await getUser("ROUTE_HANDLER")) return NextResponse.redirect(studio, 303);

  const email = process.env.GUEST_EMAIL;
  const password = process.env.GUEST_PASSWORD;
  if (email && password) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) return NextResponse.redirect(studio, 303);
    console.error("[START]", error.message);
  } else console.error("[START] GUEST_EMAIL / GUEST_PASSWORD are not set");

  const retry = new URL(`/get-started${query ? `?${query}` : ""}`, req.url);
  return NextResponse.redirect(retry, 303);
}
