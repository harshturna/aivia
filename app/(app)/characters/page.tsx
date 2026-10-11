import { redirect } from "next/navigation";
import Categories from "@/components/Characters/Categories";
import Characters from "@/components/Characters/Characters";
import SearchInput from "@/components/Characters/SearchInput";
import { getUser } from "@/lib/getUser";
import prismadb from "@/lib/prismadb";

interface CharactersPageProps {
  searchParams: Promise<{ categoryId?: string; name?: string }>;
}
const CharactersPage = async ({ searchParams }: CharactersPageProps) => {
  const { categoryId, name } = await searchParams;
  const user = await getUser("SERVER_COMPONENT");

  if (!user || !user.id) {
    redirect("/login");
  }

  const userIds: string[] = [user?.id, process.env.GUEST_USER_ID!].filter(
    Boolean
  );

  const data = await prismadb.character.findMany({
    where: {
      userId: {
        in: userIds,
      },
      categoryId,
      name: {
        contains: name,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
  const categories = await prismadb.category.findMany();
  return (
    <div className="h-full p-4 pt-8 space-y-2">
      <SearchInput />
      <Categories data={categories} />
      <Characters data={data} />
    </div>
  );
};

export default CharactersPage;
