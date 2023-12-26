import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getUser("ROUTE_HANDLER");
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // TODO: Check for sucscription

    const charcter = await prismadb.character.create({
      data: {
        categoryId,
        userId: user.id,
        userName: "User",
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(charcter);
  } catch (error) {
    console.log("[CHARACTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
