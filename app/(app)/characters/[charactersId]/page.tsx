import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";
import CharacterForm from "./components/CharacterForm";

interface CharactersIdPageProps {
  params: Promise<{ charactersId: string }>;
}

const CharactersIdPage = async ({ params }: CharactersIdPageProps) => {
  const { charactersId } = await params;
  const user = await getUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  // the shared guest cannot make characters: no disabled form under a note (TICKET-054)
  if (await isGuestUser("SERVER_COMPONENT")) redirect("/characters");

  const character = await prismadb.character.findUnique({
    where: {
      id: charactersId,
      userId: user.id,
    },
  });

  const categories = await prismadb.category.findMany();

  return <CharacterForm initialData={character} categories={categories} />;
};

export default CharactersIdPage;
