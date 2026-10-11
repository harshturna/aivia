"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that reveals from blur when it loads (design §2.3). An image already in the cache
 * can finish before React attaches `onLoad`, so the mount also checks `complete`; without
 * that, a cached image stays invisible.
 */
export function RevealImage({
  className,
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    // biome-ignore lint/a11y/useAltText: alt comes through props
    // biome-ignore lint/performance/noImgElement: generated media at its own size
    <img
      ref={ref}
      {...props}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={cn(
        "transition-[filter,opacity] duration-500 ease-out",
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
        className
      )}
    />
  );
}
