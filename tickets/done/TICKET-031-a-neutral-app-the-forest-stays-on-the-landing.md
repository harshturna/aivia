# TICKET-031: A neutral app; the forest stays on the landing

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The app reads too green. Give the app warm neutral charcoal surfaces so the generated media
is the colour, and keep the forest for the landing and the thresholds into the app.

## Context
- The owner (2026-10-11), on TICKET-022: "ehh too green maybe? I don't think the app should
  be green right".
- TICKET-022 made the forest the `@theme` default (`app/globals.css`, read) and removed the
  `[data-theme="forest"]` block; the landing layout (`app/(landing)/layout.tsx`, read) no
  longer sets a theme. The Studio empty state shows a forest trace
  (`app/(app)/studio/studio-client.tsx`, read); sign-in and get-started sit on the forest
  plate with panels in `bg` (`components/auth/auth-form.tsx`, `app/get-started/guest-start.tsx`, read).
- Kept from D-004 in the app: parchment type, the sun accent, the display face, the tints.
  The dev kit (`app/(dev)/kit/page.tsx`, read) lists the swatches.
- Contrast measured for the neutral set: fg 16.3:1 on bg, fg-2 8.8:1, mute (#938f86) about
  4.8:1 on surface-3, sun 10.4:1.

## Plan
- [x] `@theme` defaults: bg #0e0e0d, surface #161615 / #1d1d1b / #262523, borders parchment at
      8% and 16%, fg #f1ecdc, fg-2 #b3afa5, mute #938f86, faint #4b4944, glass and scrim to match.
- [x] `[data-theme="forest"]` again for the landing (moss surfaces, the aliases re-declared),
      set by the landing layout; theme colours per layout.
- [x] Remove the Studio's forest trace; sign-in and get-started keep the plate.
- [x] Kit swatches, design doc §2.2; screens of the app and the landing at 1440 and 390;
      `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `@theme` defaults are warm charcoal (values in the plan; mute measured 6.0:1 on bg, 5.2:1 on surface-2, 4.8:1 on surface-3); `[data-theme="forest"]` is back for the landing with the surface-reading aliases re-declared; the landing layout sets it and a moss theme colour, the root layout a charcoal one. The Studio's forest trace is gone; sign-in, sign-up and get-started keep the plate with neutral panels. Kit swatches and design doc §2.2 updated.

## Verification
Screens at 1440 and 390 of the Studio, the library, Characters and Settings (`npm run shots`),
and of the landing and sign-in signed out: the app in charcoal with parchment type, the
landing still in the forest, sign-in on the plate.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed (axe, including colour contrast)
```

## Outcome
Shipped on `revamp`: a neutral app where the media is the colour, the forest on the landing
and at the thresholds. No follow-ups.
