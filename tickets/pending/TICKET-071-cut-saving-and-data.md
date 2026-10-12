# TICKET-071: Cut: saving, adding and playing without losing work

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
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
- [ ] Apply every async result to the current doc (ref or functional update); the queue
      waits for the guest's load.
- [ ] One save in flight, the latest doc saved after; `keepalive` on pagehide; clear timer.
- [ ] Cards commit as you type (debounced into one undo step); empty text allowed while editing.
- [ ] `change()` drops a commit equal to the top of the history.
- [ ] Play guarded by a start token; pullers stored as promises; mix key with length, old
      mixes dropped; export by iterator; URLs revoked and Inputs disposed on unmount.
- [ ] A newer cut opens read-only with a line saying so.
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
