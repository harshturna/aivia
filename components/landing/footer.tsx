import Link from "next/link";
import { navLinks } from "@/lib/links";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-screen-xl p-6 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <ul className="mb-6 hidden md:flex flex-wrap items-center text-primary opacity-60 sm:mb-0">
            {navLinks.map((link) => (
              <li key={link.route}>
                <Link href={link.path} className="mr-4 hover:underline md:mr-6">
                  {link.route}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <hr className="my-6 sm:mx-auto lg:my-8" />
        <span className="text-lg text-center flex items-center justify-center">
          <Link
            target="_blank"
            href="https://aivia.byharsh.com"
            className="hover:underline"
          >
            Aivia
          </Link>
          <span className="text-muted-foreground ml-2 text-sm mt-0.5">
            by{" "}
            <a target="_blank" href="https://harshturna.com">
              harsh
            </a>
          </span>
        </span>
      </div>
    </footer>
  );
}
