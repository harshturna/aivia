import { getUser } from "@/lib/getUser";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import ChatClient from "./components/Client";
import { isGuestUser } from "@/lib/guest-user";

interface chatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: chatIdPageProps) => {
  const user = await getUser("SERVER_COMPONENT");
  const isGuest = await isGuestUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  const character = await prismadb.character.findUnique({
    where: {
      id: params.chatId,
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
