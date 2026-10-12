# TICKET-086: Every piece can be grabbed at any zoom

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
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
- Layers in the timeline's scroller: row labels `sticky z-10`, ruler `sticky z-20`, end-of-cut shade
  and snap line `z-20`, playhead `z-30`. A chosen piece at `z-[12]` (a stacking context holding
  its own handles) sits over every other piece and handle; the row labels go to `z-[15]` so it
  never paints over them when scrolled.
- Split key: `splitAtPlayhead` in `cut-view.tsx` takes the chosen piece even when the playhead is
  outside it, then `split` refuses; falling back to the picture under the playhead fixes it.
- Fit: `cut-view.tsx` sets the zoom only; the timeline's `useLayoutEffect` on `px` only restores a
  wheel-zoom anchor. When the cut fits the view after a zoom change, scroll to 0.
- Fit keeps the old scroll, so the start of the cut can sit off screen (review 10). S does nothing
  when the chosen piece is not under the playhead (review 11).

## Plan
- [x] Handles scale with the piece: width `clamp(3px, width/4, 12px)`, so every piece keeps a body.
- [x] The chosen piece rises over its neighbours, its handles too (above other pieces' handles,
      below the sticky row labels, ruler and playhead); choose, then grab, always works.
- [x] Fit scrolls back to the start.
- [x] S with nothing under the playhead in the chosen piece splits the picture under the playhead.
- [x] The sweep's probe (choose each piece by a visible point, then both ends reachable) passes
      on 20 seeds; an e2e test for a short still between two crossfaded clips at Fit.
- [x] Screens at 1440 and 390; `npm run verify`; `npx playwright test`.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.
- 2026-10-12 — Started; layers and the split and Fit paths read (Context).
- 2026-10-12 — Raising the whole chosen piece (`z-[12]` on its box) covered the short still beside
  it; only the chosen piece's handles rise now, bodies keep their order. The hover mark (`::after`
  4 px in from the edge) sat outside a 3 px handle and widened it over the body; it centres in a
  narrow handle. Free rows: a shorter piece stacks over a longer one (its box gets a z by rank),
  so a piece dropped inside another stays visible; the chosen piece's box drops its z so its
  handles (`z-[12]`) escape above every other piece. New e2e test: zoomed out past Fit, a short
  still after a crossfade — fails on the old timeline (picture 1's end), passes now.
- 2026-10-12 — Sweep, 20 seeds × 40 steps: the last misses were pieces scrolled under the row
  labels; the probe now scrolls to a piece before reaching for it, as a person would. Clean.

## Handoff
- **State:** done; see Outcome.
- **Blocked on:** nothing
- **Next:** TICKET-087.
- **Read first:** this ticket; `components/timeline/timeline.tsx`; `.audit/t085/sweep.mjs`.

## Verification
```
SEEDS=1..20 node .audit/t085/sweep.mjs   # 20 seeds × 40 steps: "no piece lost an end"
npx playwright test -g "short still"     # fails on the old timeline, passes now
npm run verify                           # lint, typecheck, 88 tickets, 177 unit tests passed
npx playwright test                      # 43 passed, 3 skipped (2.8 m)
npm run shots                            # state-cut at 1440 and 390 unchanged at rest
```
In use (`.audit/t085/inuse-086.png`): zoomed out past Fit, a 0.5 s still after a crossfade
with the clip chosen; both pieces show their own ends and the view starts at 0:00. The
web-design-guidelines check over `timeline.tsx` raised nothing. Not pushed.

## Outcome
Shipped: trim handles scale with a piece (3–12 px), so a short piece keeps a body to choose and
move it by; the chosen piece's handles sit over everything it overlaps; on the free rows a
shorter piece stacks over a longer one; Fit shows the cut from the start; S splits the picture
under the playhead when the chosen piece is elsewhere. Left out: Alt+arrows scrolling the view
with the piece (review 11, minor).
