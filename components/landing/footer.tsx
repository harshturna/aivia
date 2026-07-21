import Link from "next/link";
import { navLinks } from "@/lib/links";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="h-6 w-6" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Aivia
            </span>
          </Link>
          <ul className="flex flex-wrap items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.route}>
                <Link
                  href={link.path}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.route}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Link
            target="_blank"
            href="https://aivia.byharsh.com"
            className="font-medium text-foreground hover:underline"
          >
            Aivia
          </Link>
          <span>
            by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://harshturna.com"
              className="hover:underline"
            >
              harsh
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
