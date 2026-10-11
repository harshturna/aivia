# TICKET-056: Catch layout breaks in use, automatically

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
The TICKET-050 audit found ~135 problems that `npm run shots` and the e2e suite could not see,
because they capture each screen once, fresh, at two sizes. Add the states where the problems
were, so the next one fails a check instead of reaching the live site.

## Context
- The live site deploys from GitHub through Railway (commit status "Railway is deploying",
  response header `server: railway-hikari`), not Vercel as CLAUDE.md's Deploys section says.
  Correct CLAUDE.md here, and the comments that assume Vercel's 4.5 MB request limit
  (`components/studio/cut.tsx` KEEP_BYTES, `app/api/cuts/route.ts`); owner agreed 2026-10-11.
- Files: `scripts/shots.mjs`, new `tests/e2e/in-use.spec.ts`, `CLAUDE.md` (Deploys, rule 6),
  `components/studio/cut.tsx` and `app/api/cuts/route.ts` (comments).
- Why the existing landing check missed the reduced-motion headline: Playwright's
  `toBeVisible` counts `opacity: 0` as visible. The new checks read opacity.
- `scripts/shots.mjs`, `tests/e2e/screens.spec.ts`; TICKET-050 "Why the earlier audits missed
  these".
- The states: a long seeded thread scrolled to the end, a short window (1440x600), phone-width
  dialogs (palette with long results, lightbox for audio), the sidebar with five local sessions
  plus examples, landing at 390 and with reduced motion.

## Plan
- [x] `tests/e2e/in-use.spec.ts`, desktop and phone projects where they apply: a long seeded
      thread scrolled to its end leaves at most 120 px above the composer; the sidebar list
      ends above its footer at 1440x600 and in the phone sheet at 390x667; the palette with
      long results stays inside the viewport; the mode menu stays inside a 600 px window; the
      audio lightbox does not widen the page at 390; the landing's Studio frame keeps its
      content inside at 390; the landing headline is opaque with reduced motion.
- [x] `npm run shots` also captures those states (`STATES=0` to skip).
- [x] CLAUDE.md: Deploys says Railway; rule 6's screenshot review includes the in-use states.
      The cut-size comments stop citing Vercel.
- [x] Verify: the new spec passes on HEAD; with three pre-fix files restored from b3c03ba
      (sidebar, dialog, Studio frame) its checks for those fail; `npm run verify`.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; plan written.
- 2026-10-11 — Built. The frame check first passed against the old frame: it measured before
  the replay's media arrived, and on a phone the replay had not started (it begins when the
  frame is on screen). It now scrolls the frame in and waits for the media.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** nothing in this series.
- **Read first:** nothing

## Verification
```
npx playwright test tests/e2e/in-use.spec.ts        # HEAD: 13 passed, 1 skipped (the mode
                                                    # menu check is desktop-only)
pre-fix files from b3c03ba, one run each, then restored:
  components/shell/sidebar.tsx      → sidebar check fails on desktop and phone
  app/(landing)/_landing/hero.tsx   → reduced-motion headline check fails on both
  app/(landing)/_landing/studio-demo.tsx → frame check fails on phone
                                      (content 488 px in a 367 px frame)
node scripts/shots.mjs              # the seven state-* shots written; reviewed
npm run verify                      # lint, typecheck, tickets, 82 unit tests: pass
npm run test:e2e                    # 37 passed, 1 skipped
```

## Outcome
Shipped: `tests/e2e/in-use.spec.ts` (a long thread's end, the sidebar in short windows, the
palette and a sound's page on a phone, the mode menu in a short window, the landing frame on a
phone, the reduced-motion headline), the same states in `npm run shots`, CLAUDE.md rule 6
asking for in-use screenshots, CLAUDE.md's Deploys section corrected to Railway, and the cut
size comments no longer citing Vercel. Left out: nothing.
