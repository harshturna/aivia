"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Before this existed, an unhandled render error
 * showed a blank page in production.
 */
export default function ErrorPage({
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
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-[32px] font-medium leading-tight">
        Something went wrong
      </h1>
      <p className="max-w-sm text-[14px] leading-6 text-fg-2">
        The page did not load. Try again, and if it keeps happening, come back a
        little later.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
