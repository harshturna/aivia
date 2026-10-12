# TICKET-078: The landing shows the cut

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Every promise on the landing is seen working: the Studio frame replays Make and then Cut, and reduced motion shows the cut story too.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- The owner asked (2026-10-11) why the landing's demo shows no editing; the design review rated
  it major: the Studio lede sells trim, reorder, timeline, storyboard and new take while the frame
  replays only the run; §17.10 asks for Make then Cut replayed.
- Desktop QA: with reduced motion the media cards and the cut timeline scene are skipped; the
  hero's inline media chips touch the next word at 1024.
- Files: `app/(landing)/_landing/studio-demo.tsx`, `components/studio/run-demo.tsx`,
  `lib/landing-media.ts`, `app/(landing)/_landing/hero.tsx`.

## Plan
- [ ] After the run, the frame's header switches to Cut and the pieces land on lanes, a trim
      and a crossfade play out; the lede says one idea.
- [ ] Reduced motion shows the finished cut frame; the hero chips spaced.
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
