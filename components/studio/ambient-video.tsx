"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted looping clip that plays only when motion is welcome (TICKET-014): under
 * `prefers-reduced-motion` it stays on its poster. Server components can render it.
 */
export function AmbientVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (allowed) v.play().catch(() => {});
    else v.pause();
  }, [allowed]);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
