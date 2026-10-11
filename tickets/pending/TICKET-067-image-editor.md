# TICKET-067: The image editor

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
Edit on any image opens the editor over the project's stage: crop, adjust, text and the AI tools as steps on the source; Save makes a version; `/edit` redirects.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 063, 064. Reads `components/edit/workspace.tsx`, `lib/edit.ts`.

## Plan
- [ ] Editor shell and steps; react-easy-crop; colour-matrix export; text boxes.
- [ ] AI tools as steps through the guard; versions in the tray; reopen editable.
- [ ] `/edit` redirects; the Edit page goes.
- [ ] Landing: a section showing a still becoming a poster.
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
