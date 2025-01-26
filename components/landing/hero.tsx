import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroHeader } from "@/config/contents";

export default function HeroHeader() {
  return (
    <section className="container flex flex-col gap-4 pb-12 pt-4 text-center lg:items-center lg:gap-4 lg:py-5 mt-20">
      <div className="flex flex-1 flex-col items-center gap-4 text-center lg:gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold lg:text-5xl">
            {heroHeader.header}
          </h1>
          <h2 className="text-lg font-light text-muted-foreground lg:text-3xl">
            <span className="gradient-text">aivia</span>
            {heroHeader.subheader}
          </h2>
        </div>
        <Link
          href="/init"
          className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
        >
          Explore our tools
        </Link>
      </div>
      {heroHeader.image !== "" ? (
        <div className="flex flex-1 justify-center lg:justify-end">
          <img
            src={heroHeader.image}
            width={500}
            height={500}
            alt="Header image"
          />
        </div>
      ) : (
        <></>
      )}
    </section>
  );
}
