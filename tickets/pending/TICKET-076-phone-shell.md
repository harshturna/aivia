# TICKET-076: The phone: tab bar, touch actions, tap targets

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
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
- [ ] Tab bar below 640 (and Cut below 1024): Make, Media, Cut; Media is the tray as a
      two-column grid; a tile opens its action sheet; long press opens it in the thread.
- [ ] Clip actions on tap; Media label by viewport; touch copy; tiles not draggable on touch.
- [ ] 44 px targets on touch (pointer: coarse); palette hints hidden on touch; header fixes.
- [ ] "Removed. Undo" toast on swipe.
- [ ] §17.4 updated to what is built.
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2). Each fixed finding gets a test that fails before the fix
      where it can be tested.
- [ ] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan.
- **Read first:** this ticket.

## Verification

## Outcome
