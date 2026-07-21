import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroHeader } from "@/config/contents";

export default function HeroHeader() {
  return (
    <section className="relative overflow-hidden">
      {/* Background treatment: a soft radial brand glow and a fading grid.
          The hero was previously flat white with zero atmosphere. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 80%)",
          }}
        />
      </div>

      <div className="container flex flex-col items-center gap-6 pb-16 pt-24 text-center lg:pt-32">
        <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Now with an agentic Studio
        </p>

        <h1
          className="animate-fade-up font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "60ms" }}
        >
          {heroHeader.header}
        </h1>

        <p
          className="animate-fade-up max-w-xl text-lg text-muted-foreground lg:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          <span className="gradient-text font-display font-semibold">
            aivia
          </span>
          {heroHeader.subheader}
        </p>

        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "180ms" }}
        >
          <Link
            href="/init"
            className={cn(buttonVariants({ size: "lg" }), "group")}
          >
            Try it now
            <ArrowRight
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/#features"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            See what it does
          </Link>
        </div>

        {heroHeader.image !== "" && (
          <div
            className="animate-fade-up mt-6"
            style={{ animationDelay: "240ms" }}
          >
            <Image
              src={heroHeader.image}
              width={420}
              height={420}
              priority
              alt="Abstract tree illustration, branching above and rooting below"
              className="mx-auto h-auto w-full max-w-[420px] invert"
            />
          </div>
        )}
      </div>
    </section>
  );
}
