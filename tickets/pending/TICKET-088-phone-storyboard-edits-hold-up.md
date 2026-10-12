# TICKET-088: Phone storyboard edits hold up

**Status:** pending
**Created:** 2026-10-12
**Started:** —
**Completed:** —
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
- [ ] The Removed bar leaves when any other edit lands.
- [ ] Overlapping trim handles: the one nearer the pointer wins.
- [ ] The card sheet gains start and length; the score sheet a length.
- [ ] Screens at 390; `npm run verify`; `npx playwright test`.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** the plan.
- **Read first:** this ticket; `components/timeline/storyboard.tsx`.

## Verification

## Outcome
