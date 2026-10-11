# TICKET-054: Shell, palette, dialogs, Characters, Settings and auth fixes

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The sidebar scrolls in short windows, dialogs fit phones, character chat limits lead somewhere, one sign-up nudge instead of several, and errors, loading and 404 states sit inside the app.

## Context
- Findings: TICKET-050, section D. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Files: `components/shell/sidebar.tsx`, `components/shell/recents.tsx`,
  `components/shell/command-palette.tsx`, `components/shell/account-menu.tsx`,
  `components/shell/shell.tsx` (skip link), `components/ui/dialog.tsx`, `components/ui/sheet.tsx`,
  `components/ui/kbd.tsx`, `components/ui/input.tsx`, `components/characters/chat.tsx`,
  `components/characters/filters.tsx`, `app/(app)/characters/page.tsx`,
  `app/(app)/characters/[charactersId]/page.tsx`, `app/(app)/settings/page.tsx`,
  `components/auth/auth-form.tsx`, `app/(auth)/(routes)/login|signup/page.tsx`,
  `app/(auth)/loading.tsx`, `app/(app)/loading.tsx`, `hooks/useGuestLogin.ts`,
  `app/get-started/guest-start.tsx`, `app/error.tsx`, `app/not-found.tsx`, new
  `app/(app)/error.tsx`, `app/(app)/characters/not-found.tsx`,
  `components/studio/composer.tsx` (a one-row layout), and the Studio's `LimitMessage`
  moved to `components/studio/limit-message.tsx` to share with character chat.
- Kept: Settings' Account card keeps its "Create an account" button (it is where a guest goes
  to ask about an account); the Characters header link and the /characters/new form are what
  repeat the sidebar's note. Seeded category names are title case in the database; they are
  shown in sentence case rather than rewriting live rows.
- Moved here from TICKET-052: the skip link. The guest-start failure (TICKET-050 §E) is fixed
  here too, because it is the same hook as the sign-in page's.
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [x] Sidebar: recents scroll in their own region, so short windows never overlap the footer;
      the phone sheet uses its full width; nav items drop their fill while a recent row is the
      open page.
- [x] Dialogs: one explicit column (no growth past the screen), a 16 px gutter on phones, one
      scrim (`bg-scrim`), titles on the type scale. Palette: `min-w-0`, a Cancel button on
      touch instead of the Esc keycap, a guest's local sessions searchable, key caps for the
      new-session hint, plain kind labels and the right icon for sounds, an empty state with
      a next step.
- [x] Character chat: limits through the shared `LimitMessage` (free: upgrade; guest: create
      an account); the composer's backing is solid under it; a composer with no tools is one
      row; the name is not repeated over every reply; a guest is told the chat is not kept.
- [x] Nudges: no Characters header link for guests; guests sent away from /characters/new; the
      account menu shows the email for an account and "Keyboard shortcuts" for everyone.
- [x] Characters: chip focus rings not clipped; categories in sentence case; an empty search
      offers "Clear search"; a missing character says so with a way back.
- [x] Errors and states: an (app) error boundary inside the shell, honest copy, an h1; the
      root 404 has an h1 and sends signed-out visitors home; the app loading state is neutral
      and carries `data-screen-header`; the auth loader keeps the forest.
- [x] Auth: a signed-in guest sees "Back to the Studio" instead of "Try it as a guest"; a
      failed guest sign-in shows an inline error with Try again (sign-in page and the landing's
      start screen); known errors in plain words with a next step; field errors clear on
      typing; invalid fields marked; the email placeholder has no ellipsis.
- [x] Settings: the guest Plan card says what the shared allowance is; shortcuts hidden below lg.
- [x] Small: the skip link first in Tab order with room around it; ⌘ shown as Ctrl off a Mac.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright: sidebar at 1440x600 and the
      sheet at 390x667 with five local sessions, the palette with long results at 390 and
      1440, a stubbed character chat (long, scrolled; 403; 429), auth validation and a stubbed
      failing guest sign-in, 404 signed out, Settings as guest at 390; screenshots at 1440 and
      390; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Also: the Studio's composer backing is solid under the composer too
  (same fix as the chat); "Plan and credits" is hidden from the guest's account menu (its card
  is the shared allowance); the duplicate-account error reads once with a "Sign in instead"
  link. The skip link was already first in the DOM; it now has room and a shadow.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-055.
- **Read first:** nothing

## Verification
```
npm run verify      # lint (no errors), typecheck, tickets, 82 unit tests: pass
npm run test:e2e    # 24 passed
node .audit/t054/v.mjs, issues.mjs   # Playwright; /api/chat, Supabase signup and the
                                     # guest route stubbed where a state needed them
  sidebar 1440x600: list ends at 476, footer starts at 492, the list scrolls
  sheet 390x667: list 543 / footer 559, scrolls, sidebar 279 px wide in the 280 px sheet
  palette "forest": 1440 at 420 to 1020; 390 at 16 to 374 with Cancel; groups and kind labels
  Characters: no guest header link; guest note under the greeting; composer 58 px (one row);
    one name label (the greeting); 403 offers "Upgrade to Pro", 429 "Create an account",
    composer disabled in both
  signed out: 404 h1 "Page not found", link "Go to the home page"; empty submit shows both
    field errors, typing clears one; "User already registered" reads "There is already an
    account with this email." with "Sign in instead"; failing guest start shows an inline
    error on /login and "The Studio did not open" with Try again on /get-started
  guest: /login offers "Back to the Studio" and no guest button; Settings at 390 hides the
    shortcuts, the Plan card explains the shared allowance; the first Tab is the skip link
  chat page console: no errors (two existing development warnings)
```
Screenshots reviewed: `.audit/t054/sidebar-1440x600.png`, `sidebar-390x667.png`,
`palette-390.png`, `palette-1440.png`, `chat-mid-390.png`, `settings-390.png`.
web-design-guidelines over the changed code: no findings.

## Outcome
Shipped: a sidebar that scrolls its recents in short windows and fills the phone sheet, with one
highlighted row; dialogs that fit phones with a gutter and one scrim; a palette that stays inside
the screen, has Cancel on touch, finds a guest's local sessions and labels kinds plainly;
character chat limits that lead to Pro or an account, a solid composer backing, a one-row
composer, no name over every reply, and a note that guest chats are not kept; fewer sign-up
nudges (no Characters header link, no form for guests on /characters/new, a slimmer account
menu with Keyboard shortcuts); clear characters empty states and a character 404; an error
boundary inside the shell, honest root error and 404 pages; neutral loading states; auth that
offers a signed-in guest the way back, says failed guest starts out loud, and words errors
plainly; a useful guest Plan card; Ctrl shown off a Mac. Left out: rewriting the seeded
category names in the database (shown in sentence case instead).
