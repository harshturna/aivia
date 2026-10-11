# TICKET-036: Pricing without the cards

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The landing's pricing section keeps only its heading and the line under it.

## Context
- The owner (2026-10-11): "can you remove the pricing cards? just keep the start free and the
  sub heading under it".
- `Pricing` in `app/(landing)/_landing/sections.tsx` (read): `H2` "Start free.", the lede, then
  two columns (Free $0 with "Start free", Pro $20 a month with "Go Pro") on a rule. The section
  keeps `id="pricing"`, which the nav and footer link to. `docs/design/revamp.md` §11 item 7.

## Plan
- [x] Remove the two columns; keep the heading, the lede and the id.
- [x] Design doc §11 item 7; screens at 1440 and 390; `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `Pricing` is the heading and the lede in a section that keeps `id="pricing"`; the two plan columns and their buttons are gone. Design doc §11 item 7 updated.

- 2026-10-11 — Correction: the first close was committed with `npm run test:e2e` failing 1 of 24 (`/` on desktop, axe colour-contrast on two run-demo step labels caught mid-fade: the shorter page now ends its scroll-through as the demo's steps animate in). The check now waits until no finite animation is running before axe reads the page (`tests/e2e/screens.spec.ts`); three runs of the landing check passed on desktop and phone, then the full suite.

## Verification
Screens of the section at 1440x900 and 390x844: the heading and its line between the modes
and the close.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # first run: 23 passed, 1 failed (see the correction above)
npm run test:e2e  # after the fix: 24 passed
```

## Outcome
Shipped on `revamp`: pricing is one heading and one line. The nav and footer still say
"Pricing" and land here, though the section no longer names a price. No follow-ups.
