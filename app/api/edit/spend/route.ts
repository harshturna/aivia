import { NextResponse } from "next/server";
import { guardGeneration } from "@/lib/ai/guard";

/**
 * An edit spends one generation through the same guard as every generator (TICKET-042). It
 * replaces two public server actions that let any visitor push the shared guest's cap to its
 * limit. The edit itself is a Cloudinary transformation built in the browser.
 */
export async function POST() {
  const guard = await guardGeneration("ROUTE_HANDLER", 1);
  if (!guard.ok) return guard.response;
  return NextResponse.json({ ok: true });
}
