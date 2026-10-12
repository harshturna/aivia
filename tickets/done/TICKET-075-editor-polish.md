# TICKET-075: Image editor polish

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The editor holds together at every width and never loses work without a word.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings:
  - Text panel overlaps itself at 1024 (swatches into "Remove these words", "Done" over Size).
  - Words can be dragged off the picture (clamp the box inside).
  - Hold to compare after a rotate shows the original unrotated with the edit peeking out and
    the words on top: compare should replace the stage wholly.
  - Compare button off-screen at 360 and 320; panels start below the fold on short phones with
    no hint they scroll.
  - Unsaved changes: Back, Cancel and a tray pick leave without a word; `saving` stays "saved"
    after undo; a change made during a save is marked saved.
  - Save half-failures: no edit row means a version without steps; an orphaned edit per retry.
  - No-op undo steps (selecting words, Tab key-ups).
  - Words box label has a double full stop; `rounded-sm` is off the radius tokens.

## Plan
- [x] Text panel laid out on a grid that wraps; words clamped; compare replaces the stage.
- [x] Tools row and panels fit 320–1024; the panel scrolls with an edge fade.
- [x] Dirty state compared to the saved doc; in-app leaving asks; save aborts cleanly.
- [x] No-op commits dropped; copy and radius fixed.
- [x] Files (read): `components/editor/image-editor.tsx` (history, dirty, save, leaving,
      compare, tools row, TextPanel, TextHandles), `components/editor/crop-box.tsx` (radius),
      `components/timeline/history.ts` (reused: one history rule for Cut and the editor),
      `components/ui/dialog.tsx`. The rules are unit-tested in `history.test.ts`; the rest in the
      browser at 320, 390, 1024 and 1440.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started; files read.
- 2026-10-11 — Built. The editor uses Cut's history (`components/timeline/history.ts`), so
  selecting words or a Tab key-up adds no step. Unsaved means different from what was last saved
  or opened (`savedDoc`, by reference) and not merely the opened picture: undo back to it and
  nothing is unsaved; "Saved to the project" shows only while that is true; a change made during
  a save stays unsaved. Back, Cancel and a tray pick ask "Leave without saving?" (Keep editing,
  Leave without saving) when unsaved; closing the tab still has `beforeunload`. Save makes the
  edit row first and stops if it fails; a failed upload deletes the edit row it made. A word box
  stays wholly inside the picture; holding Compare hides the edit and its handles; the stage is
  46dvh on phones so the tools sit higher; the tools row's tabs scroll and Compare is an eye icon
  on phones; the Text panel goes to three columns only at xl (it overlapped at 1024) and its
  actions sit in a row below xl; Download keeps only its icon under 400 px wide; the word box's
  label drops its own last full stop; the crop corner and word box use the chip radius.

## Verification
- `components/timeline/history.test.ts` covers the history rules the editor now shares.
- In the browser (`.audit/t075/ed.mjs`) at 1440×900, 1024×768, 390×664 and 320×568: Compare's
  right edge inside the window at every width (1116, 700, 378, 308); no two controls of the Text
  panel overlap (0 at every width; it overlapped at 1024 before); words dragged 900 px off the
  top left stay inside the picture; at 1440, Cancel with changes opened "Leave without saving?",
  Keep editing stayed; holding Compare made the edit `hidden`; after undoing back to the opened
  picture, Cancel left without asking. Screenshots: `.audit/t075/text-1024.png`, `text-320.png`,
  `compare-1440.png`.
- `npm run verify`: lint, typecheck, ticket check (79), 162 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.
- Not exercised: a signed-in save that fails halfway (no non-guest account here).

## Outcome
Shipped: the editor fits 320 to 1440 without overlaps; words stay on the picture; compare shows
only the original; unsaved work is never lost without a question, and "saved" means saved;
saves never leave a version without its steps or an orphaned edit; no empty undo steps.

Left out: short names for pieces in the editor's header (TICKET-077).
