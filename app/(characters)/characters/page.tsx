import SearchInput from "@/components/Characters/SearchInput";
import Categories from "@/components/Characters/Categories";
import prismadb from "@/lib/prismadb";
import Characters from "@/components/Characters/Characters";

interface CharactersPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

const CharactersPage = async ({ searchParams }: CharactersPageProps) => {
  const data = await prismadb.character.findMany({
    where: {
      categoryId: searchParams.categoryId,
      name: {
        search: searchParams.name,
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
