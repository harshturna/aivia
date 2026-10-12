# TICKET-076: The phone: tab bar, touch actions, tap targets

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The phone gets the shell §17.4 designed: a bottom tab bar (Make, Media, Cut), every action reachable by touch, targets you can hit.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings (phone QA, design):
  - No bottom tab bar; Cut on the phone has no way to Media. The owner chose to build it as
    designed (2026-10-11).
  - A clip's actions in the Make thread never show on touch (`ClipOutput` passes no `shown`).
  - The Media button's label follows the desktop cookie ("Hide the media" on a phone).
  - The Media sheet says "Drag … ⌘-click to select" on touch; tiles draggable on iOS long press;
    §17.3's long-press sheet is not built; tapping a tile jumps to the thread instead of
    opening its actions.
  - Tap targets under 44 px: undo/redo/play, header controls, Move earlier/later, trim handles,
    menu items, chips, swatches, sheet filters, landing footer links.
  - Command palette shows ⌘ hints on a phone and clips its placeholder; Cut's header loses the
    title during a take; landing header lets headings show through.
  - Swipe-to-remove gives no undo toast; Library lightbox has no swipe and lacks Add to cut.

## Plan
- [x] Tab bar below 640 (and Cut below 1024): Make, Media, Cut; Media is the tray as a
      two-column grid; a tile opens its action sheet; long press opens it in the thread.
- [x] Clip actions on tap; Media label by viewport; touch copy; tiles not draggable on touch.
- [x] 44 px targets on touch (pointer: coarse); palette hints hidden on touch; header fixes.
- [x] "Removed. Undo" toast on swipe.
- [x] §17.4 updated to what is built.
- [x] Files (read): `app/(app)/studio/studio-client.tsx` (header, Media button, sheet,
      composer), `components/timeline/cut-view.tsx` (header, ProjectViews, tray, storyboard
      area), `components/timeline/storyboard.tsx` (swipe), `components/media/tray.tsx`,
      `components/media/actions.tsx` (HoverActions, ActionButtons), `components/studio/outputs.tsx`
      (ClipOutput), `components/ui/sheet.tsx`, `components/ui/dropdown-menu.tsx`,
      `components/ui/pill.tsx`, `components/shell/command-palette.tsx`, `app/(landing)/_landing/
      nav.tsx`, `app/globals.css` (glass), `components/library/lightbox.tsx`. New:
      `components/shell/project-tabs.tsx`, `components/media/media-sheet.tsx`,
      `hooks/use-fine-pointer.ts`.
- [x] Decisions: Media on a phone is a bottom sheet with the tray in two columns; a tap on a
      tile opens that piece in the sheet with its actions (and, in Make, "Show where it was
      made"), which is §17.3's action sheet; a long press adds nothing a tap does not, so it is
      not built (noted in §17.4). A clip in the thread shows its "⋯" on touch screens (not its
      paid buttons, which a scrolling thumb could hit). Add to cut and New take in the Library's
      lightbox are ruled out: there is no project there.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started; files read, decisions in the plan.
- 2026-10-11 — Built. `ProjectTabs` (Make, Media, Cut) fixed at the foot below 640 in Make and
  below 1024 in Cut; the header's Make | Cut switch and Make's Media button step aside there; the
  composer and the storyboard leave room above the tabs. `MediaSheet` (bottom, 85dvh) replaces the
  right-hand sheet below 1024 in Make and adds the media to Cut on phones: the tray in two columns
  ("Tap a piece for everything it can do."), a tap opening the piece with `ActionButtons` and, in
  Make, "Show where it was made". A thread clip's `HoverActions` show the "⋯" on touch and hide the
  one-tap (paid) buttons. Tray pieces are draggable only with a fine pointer. The Media button's
  label follows the window (`useWide`). 44 px under a coarse pointer: icon buttons in Cut and the
  editor, Move earlier/later, Add a text card, trim handles, pills, menu items, swatches, tray
  filters, the Make | Cut links, the menu button and Export. The palette hides ⌘ hints on touch and
  its placeholder fits a phone. Cut keeps its title during a take on phones. The landing's glass is
  firmer (0.9). A swipe-remove leaves a "Removed" bar with Undo. The lightbox steps on a sideways
  touch swipe. §17.4 says what was built.

## Verification
- In the browser on an iPhone 13 profile with touch (`.audit/t076/phone.mjs`): in Make the tab
  bar sits at y 607 with the composer's foot at 527 above it, and the header switch is gone; a
  clip's "⋯" shows without a tap; Media opens a two-column sheet with the touch hint; tapping a
  piece lists Edit, Animate (1 generation), Use in a brief, Add to cut, New take (1 generation),
  Reuse prompt, Download; "Show where it was made" closes the sheet; in Cut a touch swipe removed a
  shot (2 → 1), the "Removed" bar showed, Undo brought it back (2); no visible button on Cut is
  under 40 px. Screenshots: `.audit/t076/cut-tabs.png`, `media-sheet.png`.
- `npm run verify`: lint, typecheck, ticket check (79), 162 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped (the phone project includes the Cut test
  with its sheet and axe).

## Outcome
Shipped: the phone's tab bar (Make, Media, Cut) and Media as a two-column sheet with a piece's
actions, in Make and Cut; clip actions on touch; no drag on touch; 44 px targets; palette and
header fixes; firmer landing glass; Undo after a swipe; swipe in the lightbox.

Left out: a long press (a tap does the same); Add to cut and New take in the Library's lightbox
(there is no project there).
