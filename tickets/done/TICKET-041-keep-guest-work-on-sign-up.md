# TICKET-041: Keep guest work on sign-up

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Guests store nothing on the shared account (TICKET-038); a guest's current run should live in their own browser and be claimed into their new account when they sign up.

## Context
- One of the three additions the owner accepted on 2026-10-11 ("let's add stuff"). Guests
  store nothing on the shared account (TICKET-038), so today a guest loses a run on reload
  and has no reason-at-the-moment to sign up.
- Found while planning: the guest cannot reach `/signup` from Settings ("Create an account")
  or the sidebar foot: `app/(auth)/layout.tsx` (read) redirects any signed-in user, and the
  guest is signed in. Only "Sign out" in the account menu (`components/shell/account-menu.tsx`,
  read) lands on `/signup`. Fixed here, since this ticket depends on that path.
- Studio (`app/(app)/studio/studio-client.tsx`, `app/(app)/studio/page.tsx`, read): the guest
  flag, `useChat` with `setMessages`, the session id made on the server. Recents
  (`components/shell/recents.tsx`, read) fetch `/api/sessions`; the sidebar
  (`components/shell/sidebar.tsx`, read) knows `user.isGuest`. The auth form
  (`components/auth/auth-form.tsx`, read) pushes to `/studio` after sign-in or a sign-up that
  returns a session; email confirmation returns none (the claim then happens at sign-in).
- Storage rules to keep: sessions and assets per owner (`lib/sessions.ts`, `lib/assets.ts`).

## Plan
- [x] `lib/claim.ts` (pure, tested): sanitize a guest session for the browser (no pasted
      data URLs, a size cap), read its outputs as assets (http(s) or site paths only), and
      validate a claim (at most five sessions, uuid ids, a size cap per session).
- [x] `lib/guest-local.ts`: the guest's sessions in this browser's storage, newest first, at
      most five, every access guarded.
- [x] Studio for the guest: save the session locally as runs finish; `/studio?local=<id>`
      reopens one; after a run, a quiet note says it lives in this browser with "Create an
      account". Recents for the guest: "On this device" above the examples.
- [x] `app/(auth)/layout.tsx` lets the guest reach sign-in and sign-up.
- [x] `POST /api/claim`: a signed-in, non-guest user; each session gets a fresh id, its title
      and messages, and an asset per output; the browser copy is cleared after. The auth form
      claims after sign-in or sign-up and opens the newest claimed session.
- [x] Design doc §10 and §12; check in a browser (guest run, reload, Recents, sign-up page
      reachable, the claim route's guards and parsing); `npm run verify`, `npm run test:e2e`.
- [x] Landing: no section changes (this is a path inside the app, not a new thing to make).

## Progress log
- 2026-10-11 — Opened as a follow-up of the feature proposal.
- 2026-10-11 — Built: `lib/claim.ts` (`sanitizeMessages`, `assetsFromMessages`, `parseClaim`; 5 tests), `lib/guest-local.ts` (list, get, save, clear, `claimLocalSessions`; localStorage guarded, at most five, 400 kB per session). Studio for the guest: saves when a run finishes, `/studio?local=<id>` on first send and on reopen (`app/(app)/studio/page.tsx` uses the id), restores with `setMessages`, a note with "Create an account" after runs. Recents: "On this device" above "Examples" for the guest. `app/(auth)/layout.tsx` lets the guest through (the "Create an account" links in Settings and the sidebar were dead ends for guests). `POST /api/claim`: 401 signed out, 403 guest, fresh ids, assets per safe output. The auth form claims after sign-in or a sign-up with a session and opens the newest claimed session. Settings copy and design doc §9, §10, §12 updated.

## Verification
As the guest in a browser, one real image (a fraction of a cent): the address became
`/studio?local=<id>`, the session was in localStorage with both messages, the note showed,
Recents listed it under "On this device"; after a reload the image came back; `/signup`
returned 200 with its form for the guest; `/api/claim` answered 403 for the guest and 401
signed out; no page errors; guest rows in the database unchanged. A successful claim was not
exercised (no non-guest account here); its parsing and asset reading are unit-tested.

```
npm run verify    # lint, typecheck, check:tickets, 48 unit tests (5 new): passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: a guest's work survives a reload in their own browser, is visible in
Recents, and moves into their account when they sign up or sign in; guests can now reach
sign-up from the app. Left out: claiming after email confirmation in a different browser (the
work lives in the browser that made it). No follow-ups.
