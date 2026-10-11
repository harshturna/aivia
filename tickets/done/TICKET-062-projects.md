# TICKET-062: Projects: Home, routes and the sidebar

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Sessions become projects in the interface: Home with project cards, `/p/[id]`, the sidebar's Projects, the Library filtered by project with Open project, and the redirects.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Files: `app/(app)/studio/page.tsx` (Home), `app/(app)/studio/[id]/page.tsx` (goes; a
  redirect in `next.config.ts`), new `app/(app)/p/[id]/page.tsx`, `studio-client.tsx`
  (addresses, wording, the projects under Home's composer), new
  `components/studio/project-grid.tsx`, `lib/sessions.ts` (`listProjects` with the first three
  pieces), `lib/session-text.ts` (`projectTitle`), `components/shell/{sidebar,recents,
  nav-items,command-palette}.tsx`, `lib/shortcuts.ts`, `components/auth/auth-form.tsx`,
  `components/library/{lightbox,library-client}.tsx` and `app/(app)/library/page.tsx` (a project
  filter), `app/(landing)/_landing/studio-demo.tsx`, `app/(dev)/kit/page.tsx`, the e2e specs'
  addresses.
- Kept: the `Session` table and its "New session" default (the agent renames it on the first
  brief; the interface shows "New project"); "guest session" where it means the guest login;
  Edit stays in the sidebar until TICKET-067 replaces it with Start from a photo.
- A guest's own project lives at `/p/[id]` too: the page shows a pinned example if the id is
  one, and otherwise opens the browser's copy. `/studio?local=` redirects there.
- Reads: `app/(app)/studio/*`, `components/shell/*`, `components/library/*`, `lib/sessions.ts`, `next.config` redirects, guest local sessions.

## Plan
- [x] `/p/[id]` (a saved project, or a guest's browser copy); `/studio/:id` → `/p/:id` and
      `/studio?local=` → `/p/` redirects; the Studio client writes `/p/` addresses.
- [x] Home (`/studio`): the composer as now, then the projects as cards (a mosaic of the first
      three pieces, the title, "Updated …"); the guest sees their browser projects and the
      examples.
- [x] Sidebar: New project, Home, Library, Edit (until 067), Characters; "Projects" for the
      list, with All projects; palette, shortcuts and copy say project.
- [x] Library: `?project=` filter with a removable chip; the lightbox's "Open the project".
- [x] Landing: the Studio frame's sidebar says New project and Projects.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright: Home cards at 1440 and 390, a
      send moves to `/p/[id]`, old `/studio/[id]` and `?local=` links land on `/p/`, a guest
      project reopens at `/p/`, the library project filter; screenshots; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Also: a saved project's header has a "Media" link to the Library filtered
  to it (the way into the filter until the tray lands in 063); Home's header reads "Home" until
  the first brief; card mosaics fit one, two or three pieces; Home's heading sits higher now
  that projects follow it.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-063.
- **Read first:** nothing

## Verification
```
node .audit/t062/v.mjs   # Playwright, guest with one browser project, /api/agent stubbed
  Home: title "Home | Aivia", groups "Your projects, Examples", 5 cards (1440 and 390)
  sidebar: New project, Search, Home, Library, Edit, Characters
  a send: address /p/<new id>, header the brief's title
  /studio?local=<id> → /p/<id>, the browser copy reopened
  /studio/<example id> → /p/<id>, title "A forest older than memory | Aivia"
  Media link → /library?project=<id>, chip "A forest older than memory", its 3 pieces
npm run verify    # 93 unit tests: pass
npm run test:e2e  # 37 passed, 1 skipped
```
Screenshots reviewed: `.audit/t062/home-1440.png`, `home-390.png`, `library-project-1440.png`.
web-design-guidelines over the changed code: no findings.

## Outcome
Shipped: projects at `/p/[id]` (a guest's browser copies too), redirects from `/studio/[id]` and
`?local=`, Home with project cards, a sidebar and palette that speak of projects, a Library
project filter, and the landing frame's words. Left out: Edit stays in the sidebar until
TICKET-067; the `Session` table keeps its name.
