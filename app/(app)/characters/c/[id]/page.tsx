import type { UIMessage } from "ai";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CharacterChat } from "@/components/characters/chat";
import { getUser } from "@/lib/getUser";
import { isGuestId, isGuestUser } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";

type Params = { params: Promise<{ id: string }> };

async function load(id: string, userId: string) {
  const owners = [userId, process.env.GUEST_USER_ID].filter(
    Boolean
  ) as string[];
  return prismadb.character.findFirst({
    where: { id, userId: { in: owners } },
    include: {
      // the shared guest account keeps no history to load (TICKET-038)
      messages: {
        where: { userId },
        orderBy: { createdAt: "asc" },
        take: isGuestId(userId) ? 0 : 200,
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) return { title: "Characters" };
  const character = await load((await params).id, user.id);
  return { title: character?.name ?? "Characters" };
}

/** A conversation with a character (design §8), its history kept per user. */
export default async function CharacterChatPage({ params }: Params) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const character = await load((await params).id, user.id);
  if (!character) notFound();
  const isGuest = await isGuestUser("SERVER_COMPONENT");

  const history: UIMessage[] = character.messages.map((m) => ({
    id: m.id,
    role: m.role === "user" ? "user" : "assistant",
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <CharacterChat
      character={{
        id: character.id,
        name: character.name,
        description: character.description,
        src: character.src,
      }}
      initialMessages={history}
      canManage={character.userId === user.id && !isGuest}
    />
  );
}
