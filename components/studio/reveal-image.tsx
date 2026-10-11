"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that reveals from blur when it loads (design §2.3). It starts plain, so an image the
 * server rendered shows before the page hydrates (TICKET-051); on mount, one that has not
 * loaded yet hides and reveals when it does. An image already in the cache can finish before
 * React attaches `onLoad`, which is why the mount checks `complete` instead.
 */
export function RevealImage({
  className,
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"plain" | "waiting" | "shown">("plain");
  useLayoutEffect(() => {
    const img = ref.current;
    if (img && !(img.complete && img.naturalWidth > 0)) setPhase("waiting");
  }, []);
  return (
    // biome-ignore lint/a11y/useAltText: alt comes through props
    // biome-ignore lint/performance/noImgElement: generated media at its own size
    <img
      ref={ref}
      {...props}
      onLoad={(event) => {
        setPhase((p) => (p === "waiting" ? "shown" : p));
        onLoad?.(event);
      }}
      className={cn(
        phase !== "plain" &&
          "transition-[filter,opacity] duration-500 ease-out",
        phase === "waiting" && "opacity-0 blur-md",
        className
      )}
    />
  );
}
