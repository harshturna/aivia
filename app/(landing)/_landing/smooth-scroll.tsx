"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { useEffect } from "react";

const SCROLL_KEYS = new Set([
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
]);

/**
 * Scroll pacing on the landing (TICKET-035), as in hey-buffer: the wheel sets a target and the
 * page moves a tenth of the way there each frame, so it glides and settles instead of
 * stepping. Lenis paces the native scroll, so the hero's sticky stage and its scroll reads keep
 * working. Off under reduced motion: the scroll tracks the input and links jump.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: true,
      // fields and anything marked keep their own native scroll (TICKET-044)
      prevent: (node) =>
        node.nodeName === "TEXTAREA" || node.hasAttribute("data-lenis-prevent"),
    });

    // A scroll key mid-glide takes over at once rather than fighting the glide.
    const onKey = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key) || lenis.isScrolling !== "smooth") return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    };

    // In-page links glide too. The sections below the fold only size themselves as they come
    // near (content-visibility), so the target can move while the page travels: land, then
    // settle onto where it really is. The target then takes focus, so the skip link and the
    // nav move the keyboard too.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      // the section's scroll margin clears the fixed nav; Lenis honours it, and so does
      // the browser when Lenis is off
      const margin =
        Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const go = (pass: number) =>
        lenis.scrollTo(target, {
          duration: pass === 0 ? 1.2 : 0.5,
          onComplete: () => {
            const off = target.getBoundingClientRect().top - margin;
            if (pass < 2 && Math.abs(off) > 4) go(pass + 1);
            else {
              if (!target.hasAttribute("tabindex"))
                target.setAttribute("tabindex", "-1");
              target.focus({ preventScroll: true });
            }
          },
        });
      go(0);
      history.pushState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      lenis.destroy();
    };
  }, []);
  return null;
}
