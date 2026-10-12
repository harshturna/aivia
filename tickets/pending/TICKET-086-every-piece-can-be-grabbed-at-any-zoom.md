# TICKET-086: Every piece can be grabbed at any zoom

**Status:** pending
**Created:** 2026-10-12
**Started:** —
**Completed:** —
**Area:** ui

## Goal
In Cut's timeline, every piece can be chosen, moved and trimmed at both ends whatever the zoom,
its length, or what overlaps it. TICKET-084 fixed the rule; this fixes the hit areas.

## Context
- Found by TICKET-085: the browser sweep (`.audit/t085/sweep.mjs`, run with
  `SEEDS=1,2,... node .audit/t085/sweep.mjs` against the dev server on 3005) and the free-form
  review (`.audit/review3-freeform/`, findings 1–4, 10, 11).
- `components/timeline/timeline.tsx` draws each piece as an absolute box with two fixed 12 px
  trim handles (`z-10`, no stacking context on the piece); a later sibling paints over an earlier.
- At Fit zoom (23–56 px/s) a crossfade's overlap is a few px, so the next piece's start handle
  covers the earlier piece's end (review 1, 2): grabbing the seam trims the wrong piece.
- A short piece (0.4–0.5 s at Fit, about 20–28 px) is all handle, no body: dragging its middle
  stretches it instead of moving it (review 3).
- Free rows (words, score, sound) allow overlap; a later piece hides an earlier one's edge, and an
  earlier piece's end handle takes clicks meant for the body above it (review 4, sweep seeds 6, 7).
- Fit keeps the old scroll, so the start of the cut can sit off screen (review 10). S does nothing
  when the chosen piece is not under the playhead (review 11).

## Plan
- [ ] Handles scale with the piece: width `clamp(3px, width/4, 12px)`, so every piece keeps a body.
- [ ] The chosen piece rises over its neighbours, its handles too (above other pieces' handles,
      below the sticky row labels, ruler and playhead); choose, then grab, always works.
- [ ] Fit scrolls back to the start.
- [ ] S with nothing under the playhead in the chosen piece splits the picture under the playhead.
- [ ] The sweep's probe (choose each piece by a visible point, then both ends reachable) passes
      on 20 seeds; an e2e test for a short still between two crossfaded clips at Fit.
- [ ] Screens at 1440 and 390; `npm run verify`; `npx playwright test`.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** the plan.
- **Read first:** this ticket; `components/timeline/timeline.tsx`; `.audit/t085/sweep.mjs`.

## Verification

## Outcome
