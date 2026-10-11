# TICKET-062: Projects: Home, routes and the sidebar

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** feature

## Goal
Sessions become projects in the interface: Home with project cards, `/p/[id]`, the sidebar's Projects, the Library filtered by project with Open project, and the redirects.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Reads: `app/(app)/studio/*`, `components/shell/*`, `components/library/*`, `lib/sessions.ts`, `next.config` redirects, guest local sessions.

## Plan
- [ ] Routes `/p/[id]` (Make), Home at `/studio` with cards, `/studio/[id]` → `/p/[id]`.
- [ ] Sidebar: New project, Home, Library, Characters, Projects.
- [ ] Library: a project filter and Open project.
- [ ] Landing: the words that say session say project; the Studio frame's header.
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
