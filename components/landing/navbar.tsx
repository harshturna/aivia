"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "../Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    // Must clear the property rather than set "auto". globals.css sets
    // html/body to height:100%, so an explicit overflow on body turns it into
    // a clipped scroll container of exactly viewport height and the landing
    // page stops scrolling entirely.
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav
        aria-label="Landing navigation"
        className="container flex items-center justify-between py-3"
      >
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo className="h-7 w-7" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Aivia
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.route}>
                <Link
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  href={link.path}
                  onClick={() => window.lynq?.track(link.route)}
                >
                  {link.route}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/get-started"
            className={buttonVariants({ size: "sm" })}
            onClick={() => window.lynq?.track("Get Started")}
          >
            Get started
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            className="rounded-md p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur md:hidden animate-fade-up">
          <ul className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <li key={link.route}>
                <Link
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  href={link.path}
                  onClick={() => {
                    window.lynq?.track(link.route);
                    close();
                  }}
                >
                  {link.route}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="/get-started"
                onClick={close}
                className={cn(buttonVariants({ size: "sm" }), "w-full")}
              >
                Get started
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
