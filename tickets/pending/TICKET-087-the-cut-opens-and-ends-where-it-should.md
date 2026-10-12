# TICKET-087: The cut opens and ends where it should

**Status:** pending
**Created:** 2026-10-12
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Removing pieces never leaves black at the start or the end of the film, the playhead stays
inside the cut, and the score keeps up as the cut grows.

## Context
- Found by TICKET-085's free-form review (`.audit/review3-freeform/`, findings 5, 6, 8, 12).
- Delete an example's title card (Forest): the film opens on 1.3 s of black; the first clip's
  start cannot be moved, trimmed or nudged back to 0 (`s1-16-leading-black.png`). `packMain` in
  `lib/timeline/ops.ts` keeps the first shot's start after a title card; nothing resets it when
  the card goes. Trimming an opener's start also opens a lead.
- After removing the last pieces the playhead stays past the end ("0:12.5 / 0:09.1") and Add a
  text card lands there, stretching the film with black (`s1-17`, `s2-10`). Player time lives in
  `components/timeline/use-player.ts`; cards are added from `cut-view.tsx` and `storyboard.tsx`.
- The score does not follow the cut: after Add to cut grows the film from 9 s to 18.6 s the score
  still ends at 9 s (`s2-06`).
- Fades longer than the piece after a trim (score 1 s with 0.9 s and 4.1 s fades).

## Plan
- [ ] The main track's lead is only kept while a card covers it; otherwise the first picture is at 0.
- [ ] The playhead is clamped to the cut's length when the cut shortens; a card is never added
      past the end.
- [ ] A score that ran to the cut's end follows it as pictures are added, within its source.
- [ ] Trims keep fades within the piece.
- [ ] Fuzz invariants for each (`lib/timeline/ops.fuzz.test.ts`); `npm run verify`; `npx playwright test`.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** the plan.
- **Read first:** this ticket; `lib/timeline/ops.ts` (`packMain`, `remove`, `addToMain`).

## Verification

## Outcome
