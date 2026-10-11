# TICKET-063: The media tray and one set of item actions

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
The tray on the right of a project, grouped by brief, and one MediaActions definition per kind used in the thread, the tray, the Library and the lightbox, with multi-select, Use in a brief and Use a frame as an image.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060. Waits for the owner's approval of the §17 design.
- Reads: `components/studio/outputs.tsx`, `components/library/*`, the composer's attachments.

## Plan
- [ ] The tray (desktop, sheet 640 to 1024, Media tab on phones).
- [ ] `MediaActions` per kind; every surface uses it.
- [ ] Multi-select; drag to the composer; frame grab.
- [ ] Landing: the frame shows the tray.
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2).
- [ ] Verify: `npm run verify`, `npm run test:e2e` (with the in-use checks), Playwright in use
      at 1440, 1024 and 390, `npm run shots` (with states), web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.

## Handoff
- **State:** not started.
- **Blocked on:** the owner's approval of D-005 / §17.
- **Next:** plan from §17.
- **Read first:** `docs/design/revamp.md` §17.

## Verification

## Outcome
