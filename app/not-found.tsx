import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getUser } from "@/lib/getUser";

/** An address that is not a page. A signed-out visitor is sent home, not to sign-in (TICKET-054). */
export default async function NotFound() {
  const user = await getUser("SERVER_COMPONENT").catch(() => null);
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-[32px] font-medium leading-tight">
        Page not found
      </h1>
      <p className="max-w-sm text-[14px] leading-6 text-fg-2">
        There is nothing at this address. It may have moved, or the link has a
        typo.
      </p>
      <Link href={user ? "/studio" : "/"} className={buttonVariants()}>
        {user ? "Back to the Studio" : "Go to the home page"}
      </Link>
    </div>
  );
}
