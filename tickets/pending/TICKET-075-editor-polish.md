# TICKET-075: Image editor polish

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
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
- [ ] Text panel laid out on a grid that wraps; words clamped; compare replaces the stage.
- [ ] Tools row and panels fit 320–1024; the panel scrolls with an edge fade.
- [ ] Dirty state compared to the saved doc; in-app leaving asks; save aborts cleanly.
- [ ] No-op commits dropped; copy and radius fixed.
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
