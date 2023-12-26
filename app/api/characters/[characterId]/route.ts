import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { characterId: string } }
) {
  try {
    const body = await req.json();
    const user = await getUser("ROUTE_HANDLER");
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.characterId) {
      return new NextResponse("Character ID is required", { status: 400 });
    }

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

    const charcter = await prismadb.character.update({
      where: {
        id: params.characterId,
        userId: user.id,
      },
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
    console.log("[CHARACTER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { characterId: string } }
) {
  try {
    const user = await getUser("ROUTE_HANDLER");
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const character = await prismadb.character.delete({
      where: {
        userId: user.id,
        id: params.characterId,
      },
    });
    return NextResponse.json(character);
  } catch (error) {
    console.log("[CHARACTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
