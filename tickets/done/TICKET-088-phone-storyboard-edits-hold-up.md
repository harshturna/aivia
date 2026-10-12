# TICKET-088: Phone storyboard edits hold up

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** ui

## Goal
On the phone storyboard, Undo in the Removed bar brings back what was removed, the trim bar
never sticks, and a card's time and the score's length can be changed.

## Context
- Found by TICKET-085's free-form review (`.audit/review3-freeform/`, findings 7, 8, 9).
- Swipe a shot away, change a still's length, then Undo in the Removed bar: it undid the length
  change and the shot stayed removed. The bar calls the shared undo; it should go once another
  edit lands, or undo the removal itself.
- The trim bar's two 40 px handles overlap when the trim is short (13 px apart): the start mark
  sits under the end handle and touch drags the wrong one (`s2-12-trimbar-stuck.png`).
- The card sheet has only words and style; the score sheet only level and fades (`s2-06`, `s2-07`).
- Files: `components/timeline/storyboard.tsx`, `components/timeline/history.ts`.

## Plan
- [x] Removed bar (`Storyboard`): a counter armed by `announceRemoved`; the doc change that is
      the removal itself counts one, any later change hides the bar, so its Undo only ever undoes
      the removal.
- [x] `TrimBar`: on pointer down the edge nearer the pointer (by ms) takes the drag, whichever
      handle was hit; move and up follow `last.current.edge`, not the handle's own edge.
- [x] `ItemSheet`: a card gets "Starts at" (0 to the cut's length, `moveFree`) and "Length"
      (1–10 s, `trimEnd`); the score and sounds get "Length" (up to what the source holds,
      `trimEnd`); range inputs like the still's Length (live with `commit` false, committed on
      pointer and key up). Phone only: the desktop drags these on the timeline.
- [x] Screens at 390 (`state-cut-sheet`) and a sheet for a card in use; `npm run verify`;
      `npx playwright test`. No landing change: the landing does not list sheet controls.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.
- 2026-10-12 — Started; `storyboard.tsx` (Storyboard, Shots swipe, ItemSheet, TrimBar) and
  `trim.ts` (`STILL_MS`) read; plan made concrete.
- 2026-10-12 — Built. The new phone e2e test needed care to test the right thing: a role query
  misses the Removed bar while a sheet hides the page, and the bar hides itself after 5 s, so it
  checks the markup within 1 s of the sheet closing; a handle measured while the sheet is still
  rising misses, so it waits for the sheet's animations. Fails on the old storyboard at each half
  (bar still there; start stuck at 4.8 s), passes now.

## Handoff
- **State:** done; see Outcome.
- **Blocked on:** nothing
- **Next:** nothing in this series.
- **Read first:** this ticket; `components/timeline/storyboard.tsx`.

## Verification
```
npx playwright test -g "tight trim" --project=phone   # fails on the old storyboard; passes (3 runs)
npm run verify                                        # lint, typecheck, 88 tickets, 181 tests passed
npx playwright test                                   # 45 passed, 5 skipped (3.0 m)
npm run shots                                         # 48 shots; state-cut-sheet at 390 unchanged
```
In use at 390 with touch (`.audit/t085/inuse-088-card-sheet.png`, `inuse-088-trim-tight.png`):
the card sheet shows Starts at and Length; a start pushed to 4.8 of 5.0 s is pulled back to
1.5 s; the Removed bar leaves on the next edit. Web-design-guidelines over the new controls:
labelled, named, sentence case. Not pushed.

## Outcome
Shipped: the Removed bar leaves as soon as another edit lands, so its Undo only ever undoes the
removal; on the trim bar the edge nearer the finger takes the drag, so close handles never
stick; a card's sheet sets when it starts and how long it lasts, and the score's and sounds'
sheets set their length. Left out: nothing from the review.
