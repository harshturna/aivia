# TICKET-085: Editing in combination: randomised checks and a free-form pass

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** quality

## Goal
Find the bugs that only show when editing actions combine (the class of TICKET-084), by checking
the timeline's rules after thousands of random edit sequences, by checking in the real Cut view
that every piece stays reachable after random edits, and by a free-form editing pass.

## Context
- The owner found TICKET-084 in two minutes of real editing (a still trimmed short, then its
  neighbour's end could not be trimmed); every earlier test did one action at a time on a fresh
  cut, and the unit tests encoded the flawed overlap rule. He agreed (2026-10-12) to all three
  checks; fixes found go in tickets, nothing deploys without his word.
- Files: new `lib/timeline/ops.fuzz.test.ts` (randomised sequences over `lib/timeline/ops.ts`,
  `components/timeline/trim.ts`, `components/timeline/history.ts`, `lib/timeline/layout.ts`), new
  `.audit/t085/sweep.mjs` (random edits in the browser), a free-form reviewer's report in
  `.audit/review3-freeform/`.
- Invariants checked after every step: the doc parses; the main track is packed with each overlap at
  most the crossfade and half of either piece; each picture starts and ends after the one before
  (its own edges); no item below the minimum length; clips and tracks within their sources;
  the opener has no crossfade; ids unique; every item's media exists; the cut's length is the last
  picture or word's end; an op never changes the doc it was given; layers' alphas within 0..1.

## Plan
- [x] The randomised unit test, seeded, a few thousand sequences; each failure reduced to its seed
      and steps, fixed in this ticket or a follow-up.
- [x] The browser sweep: random edits through the real UI (drag, trim, split, keys, undo), then each
      piece's start and end handles hit-tested and the stage drawn.
- [x] The free-form reviewer (Cut timeline, storyboard, image editor), findings verified.
- [x] Verify: `npm run verify`; `npx playwright test` alone.

## Progress log
- 2026-10-12 — Written and started.
- 2026-10-12 — Fuzz test (2,000 seeds × 40 edits, about 4 s; a one-off 20,000 × 80 run also held)
  found fractional milliseconds reaching the doc: the playhead and drop points carry fractions into
  `addText`/`addAudio`, and `addAudio`'s fades were `duration / 2`. The schema's ms are integers, so
  the save would 400 ("Not saved"). Fixed by rounding the start and flooring the fades.
- 2026-10-12 — Browser sweep: pressing Add a text card twice at the same playhead put the second
  card exactly over the first, which could then not be chosen. `addText` now places a card after
  any card already showing at that time. Further hits are hit-area problems on the timeline (fixed
  12 px handles at low zoom, overlapping free rows): TICKET-086.
- 2026-10-12 — Free-form reviewer: 12 findings, the editor and undo/redo/reload/export held up.
  Findings 1–4, 10, 11 → TICKET-086; 5, 6, 8 (score), 12 → TICKET-087; 7, 8 (phone sheets), 9 →
  TICKET-088. The fuzz test needed its own timeout beside the other suites.

## Handoff
- **State:** done; see Outcome.
- **Blocked on:** nothing
- **Next:** TICKET-086, 087, 088.
- **Read first:** those tickets.

## Verification
```
npx vitest run lib/timeline        # 3 files, 31 tests passed (fuzz: 2,000 × 40 in about 4 s)
npm run verify                     # lint, typecheck, 88 tickets, 29 files / 177 tests passed
npx playwright test                # 42 passed, 2 skipped (2.8 m)
SEEDS=1,...,12 node .audit/t085/sweep.mjs   # findings recorded in TICKET-086
```
Not pushed.

## Outcome
Shipped: `lib/timeline/ops.fuzz.test.ts` (seeded random edit sequences with the cut's invariants
checked after each step), and from what it and the sweep found, `addText`/`addAudio` round
positions and fades to whole ms and a new card never lands on one already showing. The browser
sweep (`.audit/t085/sweep.mjs`) and the reviewer's evidence (`.audit/review3-freeform/`) stay in
the ignored `.audit` folder. Left out, as follow-ups: TICKET-086 (grabbing pieces at any zoom),
TICKET-087 (the cut's opening and end, the score following the cut), TICKET-088 (phone
storyboard edits).
