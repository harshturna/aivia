# TICKET-078: The landing shows the cut

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
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
- [x] After the run, the frame's header switches to Cut and the pieces land on lanes, a trim
      and a crossfade play out; the lede says one idea.
- [x] Reduced motion shows the finished cut frame; the hero chips spaced.
- [x] Files read and touched: `app/(landing)/_landing/studio-demo.tsx`, new
      `app/(landing)/_landing/cut-scene.tsx`, `app/(landing)/_landing/hero.tsx` (the windows'
      spacing), `lib/landing-media.ts` (read), `components/studio/run-demo.tsx` (read: `onDone`
      fires at the end and again when the replay starts over).
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started and built. The Studio frame's header has a Make | Cut toggle (real
  buttons in a fieldset, replacing a dead "Rename"); when the replay has made everything the frame
  turns to Cut after 1.8 s and back to Make when the replay starts over, unless the viewer chose a
  view. `CutScene` lays the run's pieces on four lanes as Cut does (the card, the clip and the still
  with frames and a crossfade, the score), lands them one by one, trims the still and plays the
  playhead through. With reduced motion the frame does not turn by itself (that is motion); Cut is
  one press away and shows its finished state, still. The lede says the two ideas once: make, then
  cut (timeline or storyboard; trim, reorder, retitle, new take, export). The hero's media windows
  get a word space after them (`mr-[0.24em]`; they touched the next word at 1024).
- 2026-10-11 — The hero's own "Cut together on one timeline" scene stays as TICKET-055 left it under
  reduced motion (its opening frame held); the Studio frame now carries the cut story there.

## Verification
- In the browser (`.audit/t078/land.mjs`, `hero.mjs`): at 1440 and 390 the frame's Cut button
  became pressed on its own after the run and the Cut scene played (screenshots
  `.audit/t078/studio-1440.png`, `studio-390.png`); with reduced motion the frame stayed on Make and
  pressing Cut showed the finished cut (`studio-1440-rm.png`); the hero at 1024 has a space between
  each window and the next word (`hero-crop.png`).
- `npm run verify`: lint, typecheck, ticket check (79), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped (the landing passes axe with the toggle).

## Outcome
Shipped: the landing's Studio frame shows Make and then Cut, the run's pieces landing on the
cut's lanes; a viewer can switch between them; the lede says make, then cut; the hero's windows
no longer touch their words.

Left out: animating the hero's own cut scene under reduced motion (TICKET-055's decision stands).
