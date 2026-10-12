# TICKET-066: Cut on the phone: the storyboard

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Below 1024 px, Cut as a vertical storyboard: the player, shots in order with reorder, swipe to remove and a trim sheet, the score row, Export.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 065 (done, `3bf93a4`).
- Today below 1024 the Cut view (`components/timeline/cut-view.tsx`) shows the stage as
  `flex-1` (a small canvas in a tall black box at 390), the desktop controls (split, zoom, Fit
  do nothing useful without the timeline) and a note "Open this on a wider screen…". The tray
  is `hidden lg:block`, so the phone adds pieces with Add to cut from the Make view.
- Files: new `components/timeline/storyboard.tsx` (+ the trim sheet in it); new
  `components/timeline/trim.ts` (+ test: the handle values to `trimStart`/`trimEnd` deltas);
  `components/timeline/cut-view.tsx` (phone layout, storyboard in place of the note, controls
  trimmed below lg); `components/timeline/inspector.tsx` (reused inside the sheet as is);
  `lib/timeline/ops.ts` (`moveMain`, `trimStart`, `trimEnd`, `remove`, `update` used as they
  are); `components/ui/sheet.tsx` (the bottom sheet); `app/(landing)/_landing/studio-demo.tsx`
  (the lede); `tests/e2e/screens.spec.ts` (the Cut test runs on the phone project too).
- Decisions: the storyboard edits the same `TimelineDoc` with the same ops, history and
  autosave as the timeline; no new document shape. Reorder by a handle (pointer drag in the
  list) with Move earlier / Move later in the sheet as the keyboard and tap path; swipe left on
  a shot removes it, with Remove in the sheet as the non-gesture path and Undo in the controls.
  A still's trim is its length (1 to 10 s); a clip's trim is two handles over its source.
- Ruled out: a timeline on phones (§17.11); split on phones (not in §17.4).
- Landing: there is no phone frame of the Cut on the landing (the Studio demo replays a run);
  the lede already names trim, reorder, retitle and export. The change is the lede saying it
  works on a phone too.

## Plan
- [x] `trim.ts`: from a clip's source length, in-point and length, the handles' range; from a
      handle moved to a value, the op and delta. Tests.
- [x] `storyboard.tsx`: Shots (the main track in order: thumbnail, label, length, a crossfade
      mark; a reorder handle; swipe left to remove; tap opens the sheet), Words (text cards, tap
      to edit; Add a text card), Score and Sound (one row each item; tap for level and fades).
- [x] The sheet (bottom): the item's name and span; for a clip two trim handles (sliders with
      arrow keys) over its source, for a still its length; Move earlier, Move later; then the
      Inspector (crossfade, push, words, level, fades, Remove).
- [x] `cut-view.tsx` below lg: the stage at the top at its aspect, controls play, time, undo,
      redo only, the storyboard filling the rest; the note goes.
- [x] Landing: the lede.
- [x] Verify: `npm run verify`; `npx playwright test` alone (the Cut test on desktop and
      phone); Playwright in use at 390: reorder by handle, Move earlier, swipe to remove and
      undo, trim a clip and see the length change, a still's length, edit a text card, the
      score's level, reload and the same cut; screenshots at 390 and 1440 (the desktop
      unchanged); web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built `trim.ts` (5 tests) and `storyboard.tsx`; the Inspector takes
  `heading={false}` inside the sheet; `components/ui/sheet.tsx` takes `overlayClassName`.
- 2026-10-11 — In use at 390: the sheet's scrim dimmed the stage, hiding the trim frame, so the
  storyboard's sheet has none; the trim seek landed in the opening shot's fade from black, so it
  seeks past the shot's own fade; trimming the opening shot's in-point pushed it later and left
  black before it (right for an edge drag on the timeline, wrong on a storyboard), so `setIn`
  keeps its start. A test that read the list with the sheet open found nothing: the modal hides
  the page from the accessibility tree, as it should.
- 2026-10-11 — web-design-guidelines: motion moved to classes with `motion-reduce`, the list
  `select-none` while dragging, the add button names its time ("Add a text card at 0:02").
- 2026-10-11 — `npm run shots` gains the Cut view: empty and started at 1440 and 390, and the
  storyboard's sheet at 390. `docs/design/revamp.md` §17.4 notes what was built.

## Verification
- `npm run verify`: lint, typecheck, ticket check (69), 122 unit tests passed.
- `npx playwright test` (alone): 39 passed, 1 skipped; "the Cut view starts a cut, fits,
  passes axe" now also opens a shot's sheet on the phone and passes axe with it open.
- Playwright in use at 390 as the guest (`.audit/t066/use.mjs`): Start a cut gave 2 shots,
  1 card, the score; a handle drag down one row swapped the shots; Move earlier swapped them
  back; Shift+→ twice on "Start of the clip" took the clip from 5.0 s to 3.0 s and the cut from
  0:09 to 0:07 with the frame on the stage; the still's Length went 3.2 s → 3.7 s, sheet and
  row agreeing; a swipe left removed a shot (2 → 1) without opening the sheet, Undo brought
  it back; the card's words changed to "Walk in early."; the score's level 100% → 90%; after
  reload the same shots and length. At 1440 the same cut on the timeline, unchanged.
- `npm run shots`: 0 failures; reviewed `.shots/state-cut-empty@390x844.png`,
  `state-cut@390x844.png`, `state-cut-sheet@390x844.png`, `state-cut@1440x900.png`.

## Outcome
Shipped: below 1024 the Cut view is the stage, play, time, undo and redo, and a storyboard:
Shots (thumbnail, words, length, crossfade; a handle to reorder; swipe left to remove; tap for
a sheet with two trim handles over the clip's source, or a still's length, Move earlier and
later, and the inspector's settings), Words (edit, Add a text card at the playhead) and Sound
(level, fades). The same document, ops, undo and autosave as the timeline. The landing's lede
says the cut works on a timeline at a desk or a storyboard on a phone.

Left out: none of the plan. The missing-source state stays with TICKET-069.
