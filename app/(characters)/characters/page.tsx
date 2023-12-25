import SearchInput from "@/components/Characters/SearchInput";
import prismadb from "@/lib/prismadb";
import Categories from "@/components/Characters/Categories";

const Characters = async () => {
  const categories = await prismadb.category.findMany();
  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      <Categories data={categories} />
    </div>
  );
};

export default Characters;
