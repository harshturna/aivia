# TICKET-025: The brief fades as it shrinks

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
In the triptych and timeline states the shrunken brief overlaps the window labels on wide,
short screens. Fade the brief out as it shrinks and give the freed space to the set.

## Context
- The owner (2026-10-11, screenshot of the triptych on a wide screen): "this state looks so
  messy, maybe we just fade away the top right text thing that minimizes". The brief, scaled
  to a caption, wraps to four lines and runs into the Poster and Teaser labels.
- `app/(landing)/_landing/hero.tsx` (read): `apply` scales the brief toward the caption anchor
  (`captionRef`); the triptych layer reserves the top for it (`pt-[78px]`/`sm:pt-[92px]`,
  grid `min(470px, 100svh - 300px)` in `app/globals.css` `.w-grid`), the timeline layer pads
  `pt-[210px]`/`sm:pt-[240px]` for it.
- D-004; design doc §2.3 and §11 item 2 mention the brief shrinking into a caption.

## Plan
- [x] The brief keeps its shrinking move but fades out by the time the windows land; the slot
      tints and caret go with it.
- [x] The triptych grid is centred and taller; the timeline is centred without the caption gap.
- [x] Design doc §2.3 and §11 item 2.
- [x] Screens at 1920x960, 1440x900, 1280x720 and 390x844 through the sequence; `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — The brief keeps its shrinking move and fades between 8% and 24% of the sequence, before the windows land. "Four things from one line" is removed too (the owner's "top right text"; with the brief gone it was orphaned). The triptych sits centred under the nav (grid `min(520px, 100svh - 220px)` on desktop, `min(560px, 100svh - 190px)` on a phone) and the timeline is centred without the caption gap. In a narrow words window only the first tagline shows (`@max-[240px]:hidden`). Design doc §2.3 updated.

## Verification
Screens at 1920x960, 1440x900, 1280x720 and 390x844 at 20%, 47% and 95% of the sequence:
no overlap between the brief and the window labels at any size; no page errors.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the brief fades as it shrinks, the triptych and the timeline have the
screen to themselves, and the orphaned label is gone. No follow-ups.
