# TICKET-011: - [ ] The three pages on the tokens; inline errors; focus order; the guest link.
- [ ] Verify: `npm run verify`; sign in, sign up (a throwaway address) and the guest start in
      the browser; `npm run shots` at 1440 and 390.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Auth pages and the guest start on the new base

## Context
`/login`, `/signup` and `/get-started` look like the product (design §10): the wordmark, a
serif line, the two fields, the primary button, inline errors, the guest link, and the shimmer
while a guest session starts.

## Plan
- Design §10, D-001.
- Files: `app/(auth)/layout.tsx`, `app/(auth)/(routes)/{login,signup,get-started}/page.tsx`,
  `app/(auth)/(routes)/constants.ts`, `components/SubmitLoader.tsx` (deleted),
  `hooks/useGuestLogin.ts` (kept), `app/(auth)/loading.tsx`.
- The sign-up success goes to `/studio`; the login form's error no longer resets the fields.
- Ruled out: OAuth providers (not configured).

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
