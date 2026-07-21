"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Before this existed, an unhandled render error
 * showed a blank page in production.
 */
export default function Error({
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
      <h2 className="font-display text-2xl font-semibold">
        Something went wrong
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. It has been logged — try again, and if it
        keeps happening, come back a little later.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
