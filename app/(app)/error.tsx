"use client";

import { useEffect } from "react";
import { ScreenHeader } from "@/components/shell/screen";
import { Button } from "@/components/ui/button";

/**
 * A screen that failed to render, inside the shell, so the sidebar and the way out stay
 * (design §13, TICKET-054). The root boundary still catches anything above this.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Something went wrong" />
      <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
        <p className="text-[15px]">This screen did not load.</p>
        <p className="mt-1 text-[13px] text-mute">
          Try again. If it keeps happening, reload the page.
        </p>
        <Button className="mt-5" variant="secondary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
