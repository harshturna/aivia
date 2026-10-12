# TICKET-077: Short names, frames, and one vocabulary

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Pieces read as names, not prompts; the timeline shows pictures; the same thing has the same name everywhere; the code keeps to the tokens.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings (design, desktop):
  - Every piece is labelled by its raw prompt, cut mid-word (timeline, storyboard, editor
    header, tray); the landing shows tidy names the app never does.
  - Timeline items and the phone trim bar are text bars with no frames.
  - One thing, several names: "film"/"cut"; "Save"/"Keep in project"/"In the project";
    "1 generation"/"Uses 1 generation"; "Use a frame in a brief" vs §17.3 "Use a frame as an
    image"; Shots/Words/Sound vs Picture/Text/Score/Sound; "Open the project" vs "Open project";
    menu order differs between kinds; music lacks Play as a primary.
  - Type sizes off the §2.2 scale (12.5, 13.5, 11.5, 17, 18 px); `rounded-sm` off-token; raw
    rgba and hex fallbacks in canvas code (`compositor.ts:25,75,87`, `render.ts:127`,
    `image-editor.tsx:100,843`).
  - Home shows audio as a grey tile; examples read "Updated 6 hours ago"; the tray never marks
    the piece being edited or pieces already in the cut.

## Plan
- [ ] `shortName(prompt)` (one place, tested) used for every piece label.
- [ ] Frames on Picture items (a poster per clip, drawn once) and in the trim bar.
- [ ] One verb per action across the app, §17.3 names; sizes and radii on the scale; canvas
      colours from tokens.
- [ ] Home audio tiles; examples without "Updated"; tray marks in-cut and editing pieces.
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
