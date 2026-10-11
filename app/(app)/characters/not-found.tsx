import Link from "next/link";
import { ScreenHeader } from "@/components/shell/screen";
import { buttonVariants } from "@/components/ui/button";

/** A link to a character that is gone or not shared with you (TICKET-054). */
export default function CharacterNotFound() {
  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Characters" />
      <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
        <p className="text-[15px]">That character is not here</p>
        <p className="mt-1 text-[13px] text-mute">
          It may have been deleted, or it belongs to someone else.
        </p>
        <Link
          href="/characters"
          className={`${buttonVariants({ variant: "secondary" })} mt-5`}
        >
          Back to characters
        </Link>
      </div>
    </div>
  );
}
