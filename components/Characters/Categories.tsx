"use client";

import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

interface CategoriesProps {
  data: Category[];
}

const Categories = ({ data }: CategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  const onClick = (id: string | undefined) => {
    const query = { categoryId: id };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true }
    );
    router.push(url);
  };
  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1">
      <button
        onClick={() => onClick(undefined)}
        className={cn(
          `
        flex items-center text-center text-xs md:text-sm
        px-2 md:px-4 py-2 md:py-3 rounded-md bg-slate-200/50
        hover:opacity-75 transition
    `,
          categoryId ? "bg-slate-200/50" : "bg-slate-300/80"
        )}
      >
        All
      </button>
      {data.map((item) => (
        <button
          onClick={() => onClick(item.id)}
          key={item.id}
          className={cn(
            `
        flex items-center text-center text-xs md:text-sm
        px-2 md:px-4 py-2 md:py-3 rounded-md bg-slate-200/50
        hover:opacity-75 transition
    `,
            item.id === categoryId ? "bg-slate-300/80" : "bg-slate-200/50"
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default Categories;
