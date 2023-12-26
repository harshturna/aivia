import prismadb from "@/lib/prismadb";
import CharacterForm from "./components/CharacterForm";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

interface CharactersIdPageProps {
  params: {
    charactersId: string;
  };
}

const CharactersIdPage = async ({ params }: CharactersIdPageProps) => {
  // TODO: Check Subscription

  const user = await getUser("SERVER_COMPONENT");

  if (!user) {
    redirect("/login");
  }

  const character = await prismadb.character.findUnique({
    where: {
      id: params.charactersId,
      userId: user.id,
    },
  });

  const categories = await prismadb.category.findMany();

  return <CharacterForm initialData={character} categories={categories} />;
};

export default CharactersIdPage;
