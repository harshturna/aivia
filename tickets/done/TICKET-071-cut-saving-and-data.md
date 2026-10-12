# TICKET-071: Cut: saving, adding and playing without losing work

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
No path in Cut loses work or leaks: adding pieces, autosave, typing in a card, playing and exporting are correct under real timing.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings (timeline review unless noted):
  - BLOCKER `addPiece` builds on the `doc` in its closure (`cut-view.tsx:330-365`): a guest's
    queued Add to cut runs before the local cut loads and saves an empty-plus-one cut over it;
    two queued pieces keep only the last; an edit made while a drop is probed is lost.
  - Autosave has no single flight (`cut-view.tsx:200-263`): a second PUT with the same rev
    gets a false 409 conflict and the newest doc is not saved; two first saves POST two edits;
    the pagehide flush has no `keepalive` and leaves the timer.
  - Typing in a card is committed only on blur (lost on tab close); `update()` refuses empty
    text so the last character cannot be deleted (`inspector.tsx:115`, `ops.ts:419`).
  - A plain click on an item, and Tab key-ups on sliders, commit no-op undo steps and saves
    (`timeline.tsx:180`, `inspector.tsx:86`, `storyboard.tsx:522`).
  - Double Play starts two audio sources and frame loops (`use-player.ts:212-260`); pullers
    leak decoders when a sink opens during playback (`use-player.ts:146-156`); the mix cache
    key misses the cut's length and is never freed (`use-player.ts:221-229`).
  - Export decodes from the keyframe for every frame (`export.ts:194`, `getCanvas`): use one
    `canvasesAtTimestamps` iterator per clip.
  - Export object URL revoked only on Close; mediabunny `Input`s never disposed.
  - A cut saved by newer code shows "No cut yet" instead of read-only (`cut/page.tsx:41`).

## Plan
- [x] Apply every async result to the current doc (ref or functional update); the queue
      waits for the guest's load.
- [x] One save in flight, the latest doc saved after; `keepalive` on pagehide; clear timer.
- [x] Cards commit as you type (debounced into one undo step); empty text allowed while editing.
- [x] `change()` drops a commit equal to the top of the history.
- [x] Play guarded by a start token; pullers stored as promises; mix key with length, old
      mixes dropped; export by iterator; URLs revoked and Inputs disposed on unmount.
- [x] A newer cut opens read-only with a line saying so.
- [x] Files (read): `components/timeline/cut-view.tsx` (addPiece, the queue effect, the guest
      load, persist/scheduleSave/pagehide, change/undo/redo, export modal URL),
      `components/timeline/inspector.tsx` (card words, sliders), `components/timeline/storyboard.tsx`
      (Change type, still length slider), `components/timeline/timeline.tsx` (endGesture),
      `components/timeline/use-player.ts` (play/pause/toggle, pullers, mixes),
      `components/timeline/export.ts` (`renderTimeline` loop, inputs), `lib/timeline/migrate.ts`,
      `app/(app)/p/[id]/cut/page.tsx`. Tests: new `components/timeline/history.ts` (+ test) for
      the undo stack rules, so they are tested without React.
- [x] Each fixed finding gets a test that fails before the fix where it can be tested: the
      history rules (no-op commit dropped, merged typing) as units; the races and the player in
      the browser with the reviewer's repro (`review-timeline/*.review.test.tsx` adapted).
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started; files read, plan made concrete. A cut made by newer code: migrate
  returns no doc, so the view says so instead of "No cut yet" (read-only display needs the doc
  it cannot parse; a reload is the fix).
- 2026-10-11 — Built. `docNow` is set the moment a change lands (`setCut`), so a probe, a
  queued piece or a take builds on the cut as it is; the queue waits for the guest's cut to
  load (`ready`). Saves go one at a time through `persist`, the newest queued behind; a
  conflict stops the line; pagehide sends with `keepalive`. The history is
  `components/timeline/history.ts`: no-op commits dropped, a card's or a still's words merge
  into one step and are saved as typed (`CardWords` keeps the box clearable while the card
  keeps its last words). The player numbers each play (`session`), so a pause or second press
  cancels a pending start; pullers open once per item and are stopped if the play ended while
  they opened; the mix key includes the length and only the latest mix is kept. Export reads
  each clip item through one `canvasesAtTimestamps` iterator over its own source times and
  disposes its inputs; probes and the player dispose theirs.
- 2026-10-11 — The reviewer's repro tests, inverted, are now the regression tests:
  `cut-view.test.tsx`, `cut-view.save.test.tsx`, `use-player.test.tsx`.

## Verification
- The reviewer's repro suite (`review-timeline/`, which asserts the bugs) run against the fix:
  the eight bug assertions now fail (guest media `[old.png, new.png]`, 3 items from two queued
  pieces, PUT revs `[1, 2]`, no extra sound source, no leaked reader, a fresh mix for a longer
  cut, no commit on a plain click through the view).
- Ported as regression tests asserting the fixed behaviour: `components/timeline/history.test.ts`
  (4), `cut-view.test.tsx` (2), `cut-view.save.test.tsx` (2), `use-player.test.tsx` (3).
- `npm run verify`: lint, typecheck, ticket check (78), 152 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.
- In the browser (`.audit/t071/blocker.mjs`): a guest's started cut of 4 items, then two pieces
  queued from Make: 6 items, and 6 after reload. `.audit/t071/words.mjs`: the card's box
  clears to empty, typing "Walk in early" without leaving the box saves it (same after
  reload), one undo step. The earlier runs pass unchanged: `.audit/t065/v2.mjs`, `exp.mjs`
  (9.13 s film for a 9047 ms cut), `.audit/t066/use.mjs`, `.audit/t068/take.mjs`.

## Outcome
Shipped: Cut builds every late result on the current cut (no more lost cut for a guest adding
from Make, no dropped queued pieces); one save at a time with the newest after and keepalive on
the way out; words saved as typed in one undo step and clearable; no-op undo steps gone; one
sound and one reader per play; a fresh mix per length; export decoding each packet once; inputs
disposed; a cut made by newer code says so.

Left out: the crossfade dip, short-item fades and the split minimum are TICKET-074 (layout and
behaviour); the double-charge and take fixes are TICKET-072.
