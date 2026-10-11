# TICKET-037: No scroll cue

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Remove "Scroll, and watch it get made" from the hero.

## Context
- The owner (2026-10-11): "let's remove this Scroll, and watch it get made".
- `app/(landing)/_landing/hero.tsx` (read): the cue is a `p` (`cueRef`, `.w-cue-wrap`) under
  the brief with an animated line (`.w-cue`); `apply` fades it on scroll. CSS in
  `app/globals.css` (read): `.w-cue-wrap > span`, `.w-cue`, `@keyframes w-cue`, and their
  `.is-still` and reduced-motion entries. `.w-lift` stays (the brief uses it).

## Plan
- [x] Remove the element, its ref and its line in `apply`; remove its CSS and keyframes.
- [x] Design doc mentions; screens at 1440 and 390; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — Removed the cue element, `cueRef` and its fade in `apply`, and `.w-cue-wrap`, `.w-cue`, `@keyframes w-cue` with their `.is-still` and reduced-motion entries. The design doc never named the cue, so nothing changed there.

## Verification
Screens of the first frame at 1440x900 and 390x844: the brief alone over the forest.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: no scroll cue. No follow-ups.
