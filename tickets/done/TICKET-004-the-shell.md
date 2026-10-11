# TICKET-004: - [x] `app/(app)/layout.tsx` with auth redirect, the sidebar, the sheet; every signed-in
      route moved under it; the three old layouts, their navbars, sidebars and per-segment
      loaders deleted.
- [x] `components/shell/*`: sidebar (232, rail 52, ⌘B, cookie read by the layout), credits
      meter, account menu, `ScreenHeader`/`ScreenBody`; the mobile sheet under 1024. Recents
      wait for TICKET-005; Search for TICKET-013 (no dead controls).
- [x] `/settings` per §9 with the Stripe button; the upgrade dialog rebuilt plain;
      `FreeCounter`, `LogoutButton`, `SubscriptionButton`, `Settings.tsx`, `Loading.tsx` removed.
- [x] Redirects for `/dashboard`, `/generative`, `/generative/settings`,
      `/characters/settings`. The per-tool pages stay reachable (not in the navigation) until
      TICKET-007 replaces them with direct modes and adds their redirects; `lib/links.ts` is
      unused and deleted; `constants.ts` offerings go with 007.
- [x] Verify: `npm run verify`; `npm run build`; `/dashboard` lands on `/studio`; screenshots
      at 1440 and 390 of `/studio`, `/settings`, `/characters`, `/transformations/restore`, the
      rail, the account menu and the mobile sheet; ⌘B and the cookie across a reload.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** 2026-10-10
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
- 2026-10-10 — Started after TICKET-012, on D-003's dark shell (no inset sheet; the sidebar is a surface step with a border).
- 2026-10-10 — Built and reviewed. One bug found by test: the collapsed state never applied
  after a reload because the layout imported the cookie's name from the sidebar's "use client"
  module and got a client reference instead of the string; the constant moved to
  `components/shell/constants.ts`. Also found: `npm run build` kills a running `next dev`
  (noted in CLAUDE.md); the guest's account line read "Guest / Guest".

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-005 (sessions and assets)
- **Read first:** `app/(app)/layout.tsx`, `components/shell/sidebar.tsx`

## Verification
```
npm run verify    # biome 0 errors (56 warnings in files later tickets replace), tsc clean,
                  # 16 tickets, 3 unit tests
npm run build     # Next 16.4: compiled, /studio /settings /characters dynamic, exit 0
playwright        # as the guest: ⌘B → sidebar 52 px; reload → 52 px (the cookie held);
                  # the account menu opens; /dashboard → /studio; the mobile sheet opens at 390
npm run shots     # /studio, /settings, /characters, /transformations/restore at 1440 and 390
                  # plus the rail, the menu and the sheet, all reviewed
```

## Outcome
Shipped: one signed-in layout (`app/(app)`), the sidebar with its rail, cookie and ⌘B, the
credits meter, the account menu, the screen header, the mobile sheet, `/settings` with the
Stripe button, the plain upgrade dialog, four redirects, and the dropdown, dialog and sheet
primitives restyled on the tokens. The old Studio, tool, character and transformation pages
render inside the shell as they were, each to be rebuilt by its own ticket. Left out: recents
(005), search (013), the per-tool redirects (007). No new tickets.
