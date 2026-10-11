# TICKET-065: Cut on desktop: the player and the timeline

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
The Cut view: the player, the four-track timeline with trim, split, reorder, crossfades, text cards, audio, undo and zoom, autosave, Start a cut, export and Keep in project.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 061, 063, 064. The largest ticket in the series; split it at planning if it grows past one commit's worth.

## Plan
- [ ] Player on the shared compositor; scrub and play.
- [ ] Timeline UI on pointer events (tracks, trim, split, reorder, snap, zoom, keys).
- [ ] Autosave, conflicts; export and keep.
- [ ] Landing: the frame replays Cut; the copy says you can edit the cut.
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
