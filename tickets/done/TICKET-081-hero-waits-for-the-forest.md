# TICKET-081: The hero's dawn waits for the forest

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** ui

## Goal
On an uncached visit the landing's forest photo fades in with the dawn, instead of popping in partway through it.

## Context
- The owner (2026-10-12, live site): "the image loads a little late on uncached home page and then
  flashes". It is a still, not a video: `components/forest-plate.tsx` (750 KB `forest.jpg`, through
  Next's image optimiser, AVIF), under the hero's `.w-arrive` (zoom) and `.w-dawn` (a veil from 0.7
  to 0 over 3.2 s), both started at load in `app/globals.css`. Uncached, the photo lands mid-dawn
  (the optimiser encodes it on first request) and appears at once under a half-faded veil.
- Files: `app/(landing)/_landing/hero.tsx` (the stage, `skyRef`), `app/globals.css` (`.w-arrive`,
  `.w-dawn`, reduced motion).
- Ruled out: changing the image's size or format (a separate optimisation; the timing is the
  visible problem).

## Plan
- [x] The stage starts `data-plate="waiting"`: the dawn and the zoom are paused and the photo is
      transparent; when the photo has loaded (or failed, or after 2.5 s at most) it is "ready": the
      photo fades in over 0.6 s and the dawn plays. A photo already in the cache is ready at once.
- [x] Reduced motion: no fade, as now.
- [x] Verify: `npm run verify`; `npx playwright test` alone; in the browser with the photo's
      response held back 2 s, the dawn has not started while it waits and the photo fades in after.

## Progress log
- 2026-10-12 — Written and started from the owner's report.
- 2026-10-12 — Built: the hero's stage carries `data-plate` ("waiting" until the photo has loaded,
  failed, or 2.5 s have passed; at once when it is cached); while waiting, `.w-arrive` and `.w-dawn`
  are paused and the photo is transparent; then it fades in over 0.6 s as the dawn plays. Reduced
  motion has no fade (the dawn is already off there).

## Verification
- In the browser with the photo held back 2 s (`.audit/t081/hero.mjs`): at 0.5, 1.5 and 2.6 s the
  stage was "waiting", the photo at opacity 0, the dawn paused with the veil at 0.70; at 3.2 s it
  was "ready", the photo fading in (0.67) and the veil going (0.59); at 5.2 s the photo at 1 and the
  veil at 0.01. Cached (`cached.mjs`): "ready" within 300 ms of load.
- `npm run verify`: lint, typecheck, ticket check (81), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.

## Outcome
Shipped: on a first, uncached visit the forest fades in with the dawn instead of popping in under a
half-faded veil. Not deployed in this commit; it ships with the next push to `main`.
