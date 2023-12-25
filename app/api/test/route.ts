import { getUserInRoutes } from "@/lib/getUserInRoutes";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getUserInRoutes();

  return NextResponse.json(user, { status: 200 });
}
