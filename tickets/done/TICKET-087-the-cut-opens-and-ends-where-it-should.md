# TICKET-087: The cut opens and ends where it should

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
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
- [x] `packMain` (`lib/timeline/ops.ts`) keeps the first picture's lead only while a card starts
      before it; else the first picture starts at 0. Every op that changes a card (remove,
      moveFree, trims, split on a free row) ends in `packMain`, so deleting or moving the title
      card closes the black.
- [x] `addText` puts a card no later than the cut's length less a card's length (at the end of
      the film the card lands over the last picture, not on black past it); then after any card
      showing there (TICKET-085).
- [x] `usePlayer` (`components/timeline/use-player.ts`): when the cut gets shorter than the
      playhead, the playhead moves to the new end (an effect on the length, `tell` + `setTime`).
      Covers Cut's T button (`cut-view.tsx`, `addText(doc, player.time)`) and the storyboard's
      "Add a text card at …" (`storyboard.tsx`, `addText(doc, time)`).
- [x] `addToMain`: a score that ran to the cut's old end follows it to the new end, within its
      source (`sourceLeft`).
- [x] `trimStart`, `trimEnd`, `split`: fades never longer than the piece.
- [x] Fuzz invariants: no lead without a card before the first picture; fades within each piece;
      unit tests for each change; `npm run verify`; `npx playwright test`. No landing change:
      nothing a user can do is added or renamed.

## Progress log
- 2026-10-12 — Written from TICKET-085's findings.
- 2026-10-12 — Started; `ops.ts` (packMain, addToMain, addText, trims, remove, update),
  `use-player.ts` (seek, tell) and both card buttons read; plan made concrete.
- 2026-10-12 — Built. The fade rule moved into `packMain` (every edit ends there) after the new
  fuzz invariant caught `replaceMedia` shortening a clip under its fades, a path the plan missed.
  New e2e test (Forest: delete the title card, then the last shot with the playhead at the end)
  fails on the old code at each half (opens at 0:01; playhead 7.7 s past a 5.0 s cut).

## Handoff
- **State:** done; see Outcome.
- **Blocked on:** nothing
- **Next:** TICKET-088.
- **Read first:** this ticket; `lib/timeline/ops.ts` (`packMain`, `remove`, `addToMain`).

## Verification
```
npx vitest run lib/timeline components/timeline   # 51 passed (fuzz with the two new invariants)
npx playwright test -g "title card closes"        # fails on the old ops and on the old player; passes
npm run verify                                    # lint, typecheck, 88 tickets, 181 tests passed
npx playwright test                               # 44 passed, 4 skipped (2.8 m)
```
In use (`.audit/t085/inuse-087-card-gone.png`): Forest with its title card deleted opens on the
waterfall at 0:00, 7.7 s long; after the last shot goes with the playhead at the end, the readout
is 0:05.0 / 0:05.0. Not pushed.

## Outcome
Shipped: black before the first picture only while a card plays over it (deleting or moving the
title card closes it, and trimming the opener no longer opens a gap); a new card never lands past
the film's end; the playhead follows the end in when the cut gets shorter; a score that ran to
the end keeps running to the new end as pictures are added, within its source; fades never run
longer than their piece. Left out: the phone sheets for a card's time and the score's length
(TICKET-088).
