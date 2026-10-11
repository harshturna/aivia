# TICKET-032: The Studio demo holds its size

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
On the landing, the "It plans the work, then does it." frame grows as the replay adds the
poster, the clip, the score and the taglines, so the frame and its sidebar stretch. Hold the
frame at a fixed size and let the run scroll inside it, following the newest output, as the
real Studio does.

## Context
- The owner (2026-10-11): "It plans the work section keeps growing when image is added or
  music is added etc, looks weird, like the sidebar the shell it's are all growing".
- `app/(landing)/_landing/studio-demo.tsx` (read): the frame is a grid with a 220 px aside
  and a main column `min-h-[560px]`; the run area is `flex-1` with no height limit, the
  composer is `sticky bottom-0`. `components/studio/run-demo.tsx` (read) adds outputs on a
  timer and collapses the steps at the end, so the content grows and then shrinks.

## Plan
- [x] The frame at a fixed height (620 px on a phone, 720 px from `md`); aside and main column
      fill it; the run area scrolls (`overflow-y-auto`, no visible scrollbar, a soft fade at
      the top) and the composer sits below it.
- [x] Follow the newest output: a ResizeObserver on the run scrolls the area to the bottom as
      it grows, unless the visitor has scrolled up in it; instant under reduced motion.
- [x] Check: the frame's height at the start, mid-replay and at the end is the same; screens
      at 1440 and 390; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — The frame is `h-[620px] md:h-[720px]`; the grid, aside and main column fill it; the run area is `min-h-0 flex-1 overflow-y-auto` with a hidden scrollbar and a 28 px fade at the top; the composer sits below it (`shrink-0`). `useFollow` watches the run with a ResizeObserver and scrolls the area to the bottom (smooth, instant under reduced motion) while the visitor has not scrolled up in it.

## Verification
Playwright measured the frame at 0.3, 2.5, 5 and 8.5 s into the replay: 720, 720, 720, 720
px at 1440x900 and 620 at every point at 390x844. A screenshot at the end shows the run
scrolled to the taglines inside the steady frame.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the demo frame no longer grows; the run follows its newest output inside
it. No follow-ups.
