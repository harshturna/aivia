import Link from "next/link";
import { ScreenHeader } from "@/components/shell/screen";
import { buttonVariants } from "@/components/ui/button";

/** A library link to something that is not there, or not yours (TICKET-053). */
export default function NotInLibrary() {
  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Library" />
      <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
        <p className="text-[15px]">Not in your library</p>
        <p className="mt-1 text-[13px] text-mute">
          It may have been deleted, or the link belongs to someone else.
        </p>
        <Link
          href="/library"
          className={`${buttonVariants({ variant: "secondary" })} mt-5`}
        >
          Back to the library
        </Link>
      </div>
    </div>
  );
}
