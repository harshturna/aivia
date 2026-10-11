import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";
import ChatClient from "./components/Client";

interface chatIdPageProps {
  params: Promise<{ chatId: string }>;
}

const ChatIdPage = async ({ params }: chatIdPageProps) => {
  const { chatId } = await params;
  const user = await getUser("SERVER_COMPONENT");
  const isGuest = await isGuestUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  const character = await prismadb.character.findUnique({
    where: {
      id: chatId,
    },

    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId: user.id,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!character) {
    return redirect("/characters");
  }

  return (
    <ChatClient
      character={character}
      currentUserId={user.id}
      isGuest={isGuest}
    />
  );
};

export default ChatIdPage;
