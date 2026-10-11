"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Scroll pacing on the landing (TICKET-035), as in hey-buffer: the wheel sets a target and the
 * page moves a tenth of the way there each frame, so it glides and settles instead of
 * stepping. Lenis paces the native scroll, so the hero's sticky stage and its scroll reads keep
 * working. Off under reduced motion: the scroll tracks the input and links jump.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true });

    // In-page links glide too. The sections below the fold only size themselves as they come
    // near (content-visibility), so the target can move while the page travels: land, then
    // settle onto where it really is.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const go = (pass: number) =>
        lenis.scrollTo(target, {
          duration: pass === 0 ? 1.2 : 0.5,
          onComplete: () => {
            if (pass < 2 && Math.abs(target.getBoundingClientRect().top) > 4)
              go(pass + 1);
          },
        });
      go(0);
      history.pushState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);
  return null;
}
