"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The bar (design §11): transparent over the hero, glass once the page has scrolled. */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-200",
        scrolled && "glass border-b border-border"
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-control bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <nav
        aria-label="Site"
        className="mx-auto flex h-16 max-w-[1200px] items-center gap-7 px-6 sm:px-8"
      >
        <Link href="/" className="rounded-control">
          <Logo />
        </Link>
        <div className="hidden items-center gap-6 text-[13.5px] text-fg-2 sm:flex">
          <a href="#pricing" className="hover:text-fg">
            Pricing
          </a>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/login"
            className="text-[13.5px] text-fg/80 hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            href="/get-started"
            className={buttonVariants({ size: "sm" })}
            onClick={() => window.lynq?.track("Start making")}
          >
            Start making
          </Link>
        </div>
      </nav>
    </header>
  );
}
