"use client";

import type { Category } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** "Football Player" as "Football player": copy is sentence case (the seed is not). */
function sentence(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** The search field and the category chips, both in the URL. */
export function CharacterFilters({
  categories,
  categoryId,
  name,
}: {
  categories: Category[];
  categoryId: string | null;
  name: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(name);

  const href = (next: { categoryId?: string | null; name?: string }) => {
    const p = new URLSearchParams();
    const c = next.categoryId === undefined ? categoryId : next.categoryId;
    const n = next.name ?? name;
    if (c) p.set("categoryId", c);
    if (n) p.set("name", n);
    const s = p.toString();
    return `/characters${s ? `?${s}` : ""}`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: href reads the current props
  useEffect(() => {
    if (value === name) return;
    const id = setTimeout(
      () => router.replace(href({ name: value.trim() })),
      350
    );
    return () => clearTimeout(id);
  }, [value, name, router]);

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[13px] font-medium transition-colors duration-150",
      active
        ? "border-transparent bg-surface-3 text-fg"
        : "border-border text-fg-2 hover:border-border-strong hover:text-fg"
    );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <label className="relative block w-full md:w-64">
        <span className="sr-only">Search characters</span>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search characters…"
          autoComplete="off"
          className="h-8 w-full rounded-control border border-border bg-surface pl-8 pr-2 text-[13px] text-fg outline-none transition-colors placeholder:text-mute hover:border-border-strong focus-visible:border-fg/50"
        />
      </label>
      <nav
        aria-label="Category"
        // room above and below, so a chip's focus ring is not cut by the scroll box
        className="-mx-3 -my-1 flex gap-1.5 overflow-x-auto px-3 py-1 md:mx-0 md:px-1"
      >
        <Link
          href={href({ categoryId: null })}
          replace
          aria-current={!categoryId ? "page" : undefined}
          className={chip(!categoryId)}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={href({ categoryId: c.id })}
            replace
            aria-current={c.id === categoryId ? "page" : undefined}
            className={chip(c.id === categoryId)}
          >
            {sentence(c.name)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
