import SearchInput from "@/components/Characters/SearchInput";
import Categories from "@/components/Characters/Categories";
import prismadb from "@/lib/prismadb";
import Characters from "@/components/Characters/Characters";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

interface CharactersPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}
const CharactersPage = async ({ searchParams }: CharactersPageProps) => {
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
      categoryId: searchParams.categoryId,
      name: {
        contains: searchParams.name,
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
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      <Categories data={categories} />
      <Characters data={data} />
    </div>
  );
};

export default CharactersPage;
