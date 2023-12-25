// piece of middleware to ensure the user stay logged in
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  // this gets the session of the current user and updates it if it has expired
  await supabase.auth.getSession();
  return res;
}
