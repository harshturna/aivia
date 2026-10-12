# TICKET-069: Cut: a piece that is no longer available

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
When a cut's source fails to load (an expired or deleted URL), show the item struck through with "This piece is no longer available", keep the rest playable, and let export skip or refuse it plainly.

## Context
- `docs/design/revamp.md` §17.9; left out of TICKET-065 (see its Outcome).
- Files: `components/timeline/use-player.ts` (where a source fails to open),
  `components/timeline/timeline.tsx` (the item's look), `components/timeline/inspector.tsx`,
  `components/timeline/export.ts`, `components/timeline/compositor.ts`.

## Plan
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2).
- [ ] Verify: `npm run verify`, Playwright with a doc whose media URL 404s.

## Progress log
- 2026-10-11 — Written from TICKET-065.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan.
- **Read first:** `docs/design/revamp.md` §17.9; TICKET-065.

## Verification

## Outcome
