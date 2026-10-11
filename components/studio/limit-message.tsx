"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * What a spent allowance says, wherever it is spent (the Studio, a character chat): a free
 * account is offered Pro, the shared guest an account of its own (TICKET-054).
 */
export function LimitMessage({
  kind,
  onUpgrade,
}: {
  kind: "free" | "demo";
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-media border border-border bg-surface p-5">
      {kind === "free" ? (
        <>
          <p className="text-[15px]">You have used your free generations.</p>
          <p className="mt-1 text-[13px] text-mute">
            Pro is unlimited, for $20 a month.
          </p>
          <Button className="mt-4" onClick={onUpgrade}>
            Upgrade to Pro
          </Button>
        </>
      ) : (
        <>
          <p className="text-[15px]">
            The guest session has reached its limit.
          </p>
          <p className="mt-1 text-[13px] text-mute">
            Create an account to keep making things.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/signup">Create an account</Link>
          </Button>
        </>
      )}
    </div>
  );
}
