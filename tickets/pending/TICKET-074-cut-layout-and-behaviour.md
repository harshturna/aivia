# TICKET-074: Cut: layout and behaviour

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Cut behaves like an editor: a real export dialog, shortcuts that do one thing, Fit that fits, the room the design gives it, and phone landscape that works.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings:
  - Export overlay is a div: no role, no focus trap, Esc does nothing; Space and Delete reach the
    timeline behind it; the sidebar stays clickable mid-export (design, desktop, phone).
  - ⌘B splits and also collapses the sidebar (`sidebar.tsx:64`, `cut-view.tsx:403`).
  - Fit leaves the end of the cut off-screen (it assumes 900 px).
  - Cut does not collapse the sidebar to the rail (§17.2).
  - Phone landscape: the stage fills the height, the storyboard is 0 px (`max-h` on the stage).
  - Crossfades dip toward the background at the midpoint (`layout.ts:42-51`): hold the
    outgoing item at full alpha through the incoming item's fade; short items get a fade longer
    than their overlap; `split` allows halves under `MIN_ITEM_MS`.
  - The score runs past the end of the cut after trims (template score length).
  - A title card overlaps the end card's words after a reorder; same on the phone at 0.2 s.
  - No way to scrub on the phone; time shows whole seconds so a frame step looks like nothing.
  - The Make|Cut switch moves between views; zoom ignores its anchor; selecting an item scrolls
    the timeline sideways; + and − never disable; Add to cut in Cut gives no feedback.
  - Space toggles playback while a button has focus; no keyboard way to move or trim on the
    desktop timeline; the shortcuts help leaves out Cut's keys and ⌘.
  - Export is the source clip's size, not the 720p §17.5 says.

## Plan
- [ ] Export on the shared Dialog; shortcuts off while it is open.
- [ ] ⌘B is split inside Cut only (the sidebar's handler yields there), or S alone with ⌘B
      dropped from §17.5: decide in the progress log.
- [ ] Fit measures the timeline's width; the sidebar collapses on entering Cut and restores.
- [ ] Stage capped by height on short screens.
- [ ] Crossfade alpha fixed in `layout.ts` (one path: player and export); fade clamped to the
      overlap; `split` minimum.
- [ ] The template score ends with the cut; cards keep out of each other's way.
- [ ] A scrub bar on the phone; tenths in the time readout; the view switch anchored by the
      title; zoom limits and anchor; keyboard move and trim; shortcuts help updated.
- [ ] Export at 1280×720 (fit inside, letterboxed).
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
