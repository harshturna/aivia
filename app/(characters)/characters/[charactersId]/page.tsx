import prismadb from "@/lib/prismadb";
import CharacterForm from "./components/CharacterForm";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import { isGuestUser } from "@/lib/guest-user";

interface CharactersIdPageProps {
  params: {
    charactersId: string;
  };
}

const CharactersIdPage = async ({ params }: CharactersIdPageProps) => {
  const user = await getUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  const isGuest = await isGuestUser("SERVER_COMPONENT");

  const character = await prismadb.character.findUnique({
    where: {
      id: params.charactersId,
      userId: user.id,
    },
  });

  const categories = await prismadb.category.findMany();

  return (
    <CharacterForm
      initialData={character}
      categories={categories}
      isGuest={isGuest}
    />
  );
};

export default CharactersIdPage;
