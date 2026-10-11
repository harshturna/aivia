# TICKET-014: - [ ] Playwright config and the smoke specs with axe at 1440 and 390.
- [ ] Fix what they find; VoiceOver pass of the Studio and the lightbox.
- [ ] Verify: `npm run verify`; `npm run test:e2e` green; `npm run shots` at four widths.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Accessibility and responsive pass with a Playwright smoke per screen

## Context
Every screen passes axe, has a keyboard path, honours reduced motion, and lays out at 1440,
1024, 768 and 390 with no horizontal scroll; a Playwright smoke suite loads each screen as the
guest and checks it.

## Plan
- [x] `playwright.config.ts` (desktop 1440, phone 390) and `tests/e2e/screens.spec.ts`: the
      landing (every section scrolled in), sign-in, sign-up, and as the guest the Studio, a
      saved session, the library, the lightbox (focus kept inside, Esc closes), Edit,
      Characters, the character form, Settings and the command palette; each loads with no
      page errors, fits its width, and has no serious or critical axe violation (WCAG 2.1 A
      and AA). `npm run test:e2e`; not in `verify` (it needs the running app and `.env`).
- [x] Fixes: the caption grey `--mute` raised from `#6E6E76` (3.9:1 on the canvas, though the
      design claimed 4.9:1) to `#8E8E97` (6.1:1; 4.8:1 even on the pressed surface); the
      landing's demo hints used the decorative grey for text (and said ⌘N); the guest's
      disabled portrait frame sank its label to 60% opacity; the landing's muted loops now
      stay on their posters under reduced motion (`components/studio/ambient-video.tsx`).
- [x] `npm run shots` covers 1440, 1024, 768 and 390; no overflow at 1024 or 768 on any screen.
- Not done: a VoiceOver pass (needs a person at a Mac with a screen reader); noted for the
  owner's review in TICKET-015.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — First run: 20 of 24 failed, every one on colour contrast from one token. Fixed in three passes to 24 of 24.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-015 (the review), TICKET-019 (owner's call on video), then TICKET-017
- **Read first:** `tests/e2e/screens.spec.ts`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, 19 tickets, 31 unit tests
npm run test:e2e   # 24 passed (12 checks × desktop and phone), against next dev on 3005
reduced motion on /: 0 of 9 videos playing after scrolling every section in
1024 and 768: no horizontal scroll on /, /studio, /library, /edit, /characters, /settings
```

## Outcome
Shipped: the smoke and accessibility suite, the contrast fix with the design doc corrected, reduced-motion loops, four screenshot widths. Left out: VoiceOver (needs a person). No new tickets.
