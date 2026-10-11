# TICKET-024: The landing reads without its script; dev serves the LAN

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
The owner opened the dev server from another machine (`http://192.168.2.20:3005`) and saw the
forest with no brief. Allow that origin in development, and make the hero's brief appear
even if its script never starts.

## Context
- Dev log: "Blocked cross-origin request to Next.js dev resource /_next/hmr from
  192.168.2.20". Next 16 blocks dev resources from origins other than localhost unless listed
  in `allowedDevOrigins` (`next.config.js`, read); the page's scripts never ran.
- `app/(landing)/_landing/hero.tsx` (read) renders every character transparent and reveals
  them by script (`.w-ch:not(.on)` in `app/globals.css`, read), so no script means no text.
  The same would happen on production if a chunk failed to load.
- `allowedDevOrigins` is a dev-only setting; production is unaffected.

## Plan
- [x] `allowedDevOrigins: ["192.168.2.20"]` in `next.config.js`; restart the dev server.
- [x] The hero marks its stage `is-live` when the script starts; until then, a CSS fallback
      reveals the brief after a short delay, so a page whose script never runs still reads.
- [x] Check: the page from the LAN address, and with JavaScript disabled, at 1440;
      `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's report.
- 2026-10-11 — Confirmed in the dev log (blocked `/_next/hmr` from 192.168.2.20). Added `allowedDevOrigins`; restarted dev bound to all interfaces. The hero adds `is-live` to its stage (`.w-stage`) when its effect runs; `.w-stage:not(.is-live) .w-ch:not(.on)` animates the characters visible after 1.6 s, so a page whose script never starts still shows the brief.

## Verification
Playwright at 1440x900 against `http://192.168.2.20:3005/`: with JavaScript the script runs
and types the brief (53 of 78 characters shown at 5 s on a cold dev compile), and the dev log
has no blocked requests after the restart; with JavaScript disabled all 78 characters show.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
```

## Outcome
Shipped on `revamp`: the dev server accepts the LAN origin, and the brief appears without its
script. Without the script the windows stay empty gaps; that is the accepted fallback.
