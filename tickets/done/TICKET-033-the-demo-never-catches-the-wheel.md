# TICKET-033: The Studio demo never catches the wheel

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Scrolling the landing over the Studio demo scrolls the demo instead of the page. Let the page
scroll; the demo follows its run on its own.

## Context
- The owner (2026-10-11), on TICKET-032: "it blocks the scroll now, if I am scrolling in the
  center of the page, now I am scrolling inside the box, very awkward".
- `app/(landing)/_landing/studio-demo.tsx` (read): the run area is `overflow-y-auto` with
  `overscroll-contain`, so it takes the wheel and does not hand it back to the page.
  `useFollow` scrolls it programmatically and stops following when the visitor scrolls up.

## Plan
- [x] The run area becomes `overflow-hidden` (scrollTop still moves it), no
      `overscroll-contain`; `useFollow` always follows, since nobody scrolls it by hand.
- [x] Check: a wheel over the demo moves the page (window scroll changes, the area does not
      take it); the follow still reaches the taglines; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — The run area is `overflow-hidden` (no `overscroll-contain`, no scrollbar styling needed); `useFollow` always scrolls it to the newest output.

## Verification
Playwright at 1440x900 with the pointer over the demo after the replay: wheel -300 then +600
moved the page from 5352 to 5652 px; the demo area stayed at 265 px; the last tagline was
visible inside the frame.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the page scrolls over the demo; the demo still follows its run. No
follow-ups.
