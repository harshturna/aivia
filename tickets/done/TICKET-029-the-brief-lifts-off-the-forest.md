# TICKET-029: The brief lifts off the forest

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Give the hero's brief (and its scroll cue) a deeper shadow so the words lift off the plate.

## Context
- The owner (2026-10-11): "can u give a bit of shadow to the text so they ascend a bit?"
- `app/(landing)/_landing/hero.tsx` (read): the h1 carries an inline two-layer text shadow
  (1 px tight, 40 px soft) in the background colour; the cue has none. Hero CSS lives in
  `app/globals.css` (read).
- Perf (D-004): the shadow is painted once into the brief's layer; nothing animates it.

## Plan
- [x] A `.w-lift` text shadow in `app/globals.css`: tight edge, mid depth and a wide soft
      pool, all in the background colour; on the brief and the cue.
- [x] Screens at 1440 and 390; `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `.w-lift` in `app/globals.css`: 1 px at 60%, 6/18 px at 55%, 18/60 px at 65% of the background colour; replaces the inline two-layer shadow on the brief and is added to the scroll cue.

## Verification
Screens of the first frame at 1440x900 and 390x844: the brief and cue read on their own pool
of shade, including the words over the brightest light shafts.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
```

## Outcome
Shipped on `revamp`: a deeper, layered shadow under the brief and the cue. No follow-ups.
