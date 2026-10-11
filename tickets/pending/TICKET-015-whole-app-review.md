# TICKET-015: - [ ] Reviews; the fix list in the progress log.
- [ ] Fixes; follow-up tickets for anything larger.
- [ ] Verify: `npm run verify`; `npm run test:e2e`; `npm run shots`; the owner's look.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** quality

## Goal
Whole-app review in the browser

## Context
A review of the finished revamp, screen by screen in a real browser as a guest and as a
signed-in user, against the design and the two skills, producing a fix list that is worked
through before the release.

## Plan
- Design §1 to §14; `.claude/skills/frontend-design` ("remove one accessory");
  `web-design-guidelines` over the whole tree; the research's cheap-versus-premium list in
  `research-app.md` §5.
- Two parallel review agents (opus) with the mockup and the design, each told not to spawn
  agents; findings folded into this ticket's fix list, large ones into their own tickets.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `docs/design/revamp.md`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
