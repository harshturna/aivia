# TICKET-056: Catch layout breaks in use, automatically

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
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
- `scripts/shots.mjs`, `tests/e2e/screens.spec.ts`; TICKET-050 "Why the earlier audits missed
  these".
- The states: a long seeded thread scrolled to the end, a short window (1440x600), phone-width
  dialogs (palette with long results, lightbox for audio), the sidebar with five local sessions
  plus examples, landing at 390 and with reduced motion.

## Plan
- [ ] `shots` gains those states.
- [ ] e2e asserts per state: no horizontal page scroll; dialogs and frames no wider than the
      viewport; sidebar footer not overlapped; the gap under the last message under a bound.
- [ ] CLAUDE.md rule 6: a UI ticket's screenshot review includes the in-use states.
- [ ] Verify: the new checks fail on the pre-fix commits for at least three TICKET-050 findings
      and pass after.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** extend shots, then the e2e assertions.
- **Read first:** `scripts/shots.mjs`, `tests/e2e/screens.spec.ts`.

## Verification

## Outcome
