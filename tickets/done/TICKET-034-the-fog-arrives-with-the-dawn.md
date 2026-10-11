# TICKET-034: The fog arrives with the dawn

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
On load the hero's fog flashes: it shows bright first, then settles to its translucent
state. Bring the fog in with the dawn, in its resting place from the first frame.

## Context
- The owner (2026-10-11): "when I load the page, the clouds on the bottom of the page are very
  visible first and then they get to their actual translucent state, it feels like a flash".
- `app/(landing)/_landing/hero.tsx` (read): the plate arrives darkened (`.w-dawn`, opacity
  0.7 to 0 over 3.2 s) but the near fog (`fogRef`, z-25, opacity 75%) and the mid mist
  (`mistRef`) draw at full strength above it from the first frame, so against the dark plate
  they read as a bright band. The near fog's resting offset (22% of the stage height down) is
  written by script, so before hydration it sits higher and then drops.
- CSS in `app/globals.css` (read): `w-fade-in` exists (`from { opacity: 0 }`).

## Plan
- [x] `.w-fog-in`: the fog and mist fade in from nothing over 2.8 s after 0.4 s (backwards fill,
      so they rise to their own opacity); off under reduced motion.
- [x] The near fog renders with its resting transform (`translate3d(0, 22svh, 0)`) from the
      server, matching what the script writes at the top of the sequence.
- [x] Check: frames at 100, 600, 1500 and 3500 ms after load show no bright band;
      `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `.w-fog-in` on the near fog and the mid mist; the near fog renders with `translate3d(0, 22svh, 0)`. Also found while checking: the dev overlay's "1 issue" was next/image warning that the poster's window had zero height before the script sized it; the windows now start at 4 rem (`h-16 w-16`), which the script overwrites.

## Verification
Playwright at 1440x900 after a fresh load: the near fog's opacity at 100, 600, 1500 and 3500
ms was 0.08, 0.50, 0.73 and 0.75, its offset 198 px (22svh) throughout; the frames show no
bright band. Console at 1440 and 390: no warnings.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the fog rises with the dawn in its resting place, and the dev warning
behind the "1 issue" badge is gone. No follow-ups.
