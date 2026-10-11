# TICKET-004: - [ ] `app/(app)/layout.tsx` with auth redirect, the sidebar, the sheet; move every signed-in
      route under it; delete the three old layouts and their navbars and sidebars.
- [ ] `components/shell/*`: sidebar (240, rail 48, ⌘B, cookie), recents (empty until 005),
      credits meter, account menu, sheet with header slot; the mobile sheet under 1024.
- [ ] `/settings` per §9; the plain upgrade dialog; `FreeCounter`, `ProModal`, `Settings.tsx`
      removed.
- [ ] Redirects in `next.config.js`; `lib/links.ts` and `constants.ts` offerings cleaned.
- [ ] Verify: `npm run verify`; `npm run build`; curl each deleted route for its 308;
      `npm run shots` at 1440 and 390 for `/studio`, `/settings`, `/characters`; keyboard pass
      of the sidebar (⌘B, tab order, the account menu).

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
The shell: one layout, the sidebar, the sheet, the account menu, redirects

## Context
Every signed-in route renders inside one shell (design §4): the sidebar on canvas with the
navigation, recents and the credits meter, the white sheet with its header, the account menu,
the mobile sheet, the collapsed rail, and `/settings`; the three old route groups and their
sidebars are gone and the deleted routes redirect.

## Plan
- Design §4 (the shell), §9 (settings), §3 (routes and redirects), D-002.
- Files: `app/(generative-ai)/layout.tsx`, `app/(characters)/layout.tsx`,
  `app/(transformations)/layout.tsx`, `app/dashboard/*` (all removed); `components/Sidebar.tsx`,
  `AppSidebar.tsx`, `MobileSidebar.tsx`, `Navbar.tsx`, `Characters/Sidebar.tsx`,
  `Characters/Navbar.tsx`, `Characters/MobileSidebar.tsx`, `transformations/Sidebar.tsx`,
  `transformations/Navbar.tsx`, `transformations/MobileSidebar.tsx`, `FreeCounter.tsx`,
  `LogoutButton.tsx`, `ProModal.tsx`, `SubscriptionButton.tsx`, `ui/Settings.tsx` (removed or
  rebuilt); new `app/(app)/layout.tsx`, `components/shell/{sidebar,rail,sheet,account-menu,
  credits-meter,recents}.tsx`, `app/(app)/settings/page.tsx`.
- Recents read `Session` rows once TICKET-005 lands; until then the list renders empty with
  the "All sessions" link hidden, and 005 fills it. The sidebar's collapsed state is a cookie
  read in the layout so there is no flash.
- The existing pages (studio, image, characters, transformations) move under `app/(app)` as
  they are, so the shell can be seen around real screens before 006 to 010 rebuild them.
- Redirects in `next.config.js` per design §3; `proxy.ts` leaves them to Next.
- The upgrade dialog is rebuilt plain (design §5.5) and opened from the meter and the limit
  message only.
- Ruled out: a top navigation (the app has recents and a long session list; a sidebar is the
  right shape); the shadcn Sidebar registry code (Tailwind 4 syntax, and ours is simpler).

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
