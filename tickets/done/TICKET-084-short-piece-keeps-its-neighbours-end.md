# TICKET-084: A short piece no longer hides its neighbour's end

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** feature

## Goal
In Cut, every picture keeps an end of its own to trim by, however short the piece after it is.

## Context
- The owner (2026-10-12, screenshot): a clip followed by a still trimmed short; the clip's end could
  not be trimmed, "there's no ending bar for it".
- Cause: `packMain` (`lib/timeline/ops.ts`) overlaps crossfading pieces by the crossfade, capped
  only at the shorter piece's length. A still trimmed to the crossfade's length or less sits wholly
  inside the clip's tail, so both ends coincide and the still's handle, drawn later, is on top.
- Fix: a crossfade takes at most half of either piece. `mainFades` already fades over the real
  overlap (TICKET-074), so player and export follow.
- Files: `lib/timeline/ops.ts`, `lib/timeline/ops.test.ts`.

## Plan
- [x] Cap the overlap at half of either piece in `packMain`; a test.
- [x] Verify: `npm run verify`; `npx playwright test` alone; in the browser, a clip then a still
      trimmed to 0.8 s: the clip's end handle can be dragged.

## Progress log
- 2026-10-12 — Written after the fix was made (the ticket should have come first); the cap and its
  test are in.

## Verification
- Unit: `lib/timeline/ops.test.ts` "a short piece after a crossfade": a still trimmed to 800 ms
  overlaps the clip by 400 ms (half the still), not 500, and ends after the clip.
- In the browser (`.audit/t084/trim.mjs`, the owl example's cut): after trimming the still short the
  clip spans 136–769 px and the still 749–790 px (separate ends); dragging the clip's end 60 px
  left moved it to 711 px and the still followed (690–732).
- `npm run verify`: lint, typecheck, ticket check (84), 175 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.

## Outcome
Shipped: a crossfade takes at most half of either piece, so every picture keeps its own end to trim
by. Not deployed in this commit.
