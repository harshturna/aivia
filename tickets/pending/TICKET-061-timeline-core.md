# TICKET-061: The timeline core, with Cut it together on it

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
A versioned timeline document and one compositor for preview and export, in `lib/timeline`, with today's Cut it together rendering through it. No visible change: the ground the editor stands on.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Reads: `lib/cut.ts`, `components/studio/cut-render.ts`, research engineering §1 to §3.
- Includes the mediabunny upgrade to 1.61.x and the optional AAC encoder for older Safari.

## Plan
- [ ] `lib/timeline/schema.ts` (TimelineDoc v1, zod), `migrate.ts`, `from-cut.ts` (today's template as a doc), unit tests.
- [ ] The compositor (layout and drawing shared by preview and export), generalised from cut-render.
- [ ] Cut it together builds a doc and exports through it; the output matches today's.
- [ ] Landing: none (no visible change).
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2).
- [ ] Verify: `npm run verify`, `npm run test:e2e` (with the in-use checks), Playwright in use
      at 1440, 1024 and 390, `npm run shots` (with states), web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.

## Handoff
- **State:** not started.
- **Blocked on:** nothing (§17 approved 2026-10-11).
- **Next:** plan from §17.
- **Read first:** `docs/design/revamp.md` §17.

## Verification

## Outcome
