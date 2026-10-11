import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CharacterFilters } from "@/components/characters/filters";
import { ScreenHeader } from "@/components/shell/screen";
import { buttonVariants } from "@/components/ui/button";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Characters" };

/** Characters (design §8): the shared ones and your own, searched and filtered by the URL. */
export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; name?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");
  const { categoryId, name } = await searchParams;
  const isGuest = await isGuestUser("SERVER_COMPONENT");
  const owners = [user.id, process.env.GUEST_USER_ID].filter(
    Boolean
  ) as string[];

  const [characters, categories] = await Promise.all([
    prismadb.character.findMany({
      where: {
        userId: { in: owners },
        categoryId: categoryId || undefined,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, description: true, src: true },
    }),
    prismadb.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Characters">
        {isGuest ? (
          <Link href="/signup" className="text-[13px] text-fg-2 hover:text-fg">
            Sign up to make your own
          </Link>
        ) : (
          <Link
            href="/characters/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            New character
          </Link>
        )}
      </ScreenHeader>

      <div className="px-3 pt-4 lg:px-6">
        <CharacterFilters
          categories={categories}
          categoryId={categoryId ?? null}
          name={name ?? ""}
        />
      </div>

      <div className="px-3 pb-16 pt-6 lg:px-6">
        {characters.length === 0 ? (
          <div className="mx-auto max-w-[420px] py-24 text-center">
            <p className="text-[15px]">No characters match.</p>
            <p className="mt-1 text-[13px] text-mute">
              Try another name or another category.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {characters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/characters/c/${c.id}`}
                  className="group block rounded-media"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-surface">
                    <Image
                      src={c.src}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-2.5 text-[13.5px] font-medium leading-5">
                    {c.name}
                  </div>
                  <div className="line-clamp-1 text-[12.5px] leading-5 text-mute">
                    {c.description}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
