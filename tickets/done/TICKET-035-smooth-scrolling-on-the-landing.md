# TICKET-035: Smooth scrolling on the landing (Lenis)

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Pace the landing's scroll with Lenis so the wheel glides and settles instead of stepping, the
way the sibling hey-buffer does, without breaking the hero's scroll-linked sequence.

## Context
- The owner (2026-10-11): "can we add smooth scrolling from a library called Lenis on landing?
  check the hey-buffer repo at the same level it uses it".
- `../hey-buffer` (read): `lenis` 1.3.26; `src/components/SmoothScroll.tsx` creates
  `new Lenis({ lerp: 0.1, smoothWheel: true })`, ticks it from GSAP's ticker, destroys it on
  unmount; `lenis/dist/lenis.css` is imported in the layout. Aivia has no GSAP, so Lenis runs
  its own frame loop (`autoRaf`).
- Lenis paces the native window scroll, so `position: sticky` and the scroll events the hero
  reads (`app/(landing)/_landing/hero.tsx`, read) keep working. `app/globals.css` (read) sets
  `html { scroll-behavior: smooth }`; Lenis's CSS turns that off while it runs.
- Landing only: `app/(landing)/layout.tsx` (read). In-page links (`#pricing`, the skip link
  to `#main`) go through Lenis (`anchors`). Reduced motion: no Lenis.

## Plan
- [x] `npm install lenis@1.3.26`.
- [x] `app/(landing)/_landing/smooth-scroll.tsx`: Lenis with `lerp: 0.1`, `smoothWheel`,
      `autoRaf`, `anchors`; skipped under reduced motion; destroyed on unmount; its CSS imported.
- [x] Mounted in the landing layout.
- [x] Check: the wheel glides (the page keeps moving after the last wheel event), the hero's
      states still reach the triptych and timeline, `#pricing` scrolls there, frame timing
      unchanged; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `lenis` 1.3.26 installed. `_landing/smooth-scroll.tsx` runs Lenis (`lerp: 0.1`, `smoothWheel`, `autoRaf`), mounted in the landing layout, skipped under reduced motion, destroyed on leaving. Lenis's own `anchors` overshot `#pricing` by 257 px: the sections below the fold size themselves as they near (`content-visibility`), so the target moves in transit. In-page links are handled instead with `lenis.scrollTo` and up to two short settle passes onto the target's real position; the hash is pushed.

## Verification
Playwright at 1440x900: one 400 px wheel moved the page 38, 157, 237, 280, 319, 340, 364, 376
px over 0.5 s (a glide); at 48% of the hero the triptych layer was visible; the Pricing link
landed the section at 2 px (0 px at 390x844) with `#pricing` in the URL; no page errors.
Frame timing (GPU raster, 4x throttle, the TICKET-021 script): 0 of 320 frames over 33 ms,
p95 16.7 ms, p99 16.8 ms, in two runs.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the landing glides with Lenis, in-page links land exactly, the hero's
sequence is smoother than before. The app is unchanged. No follow-ups.
