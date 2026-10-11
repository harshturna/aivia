# TICKET-011: - [ ] The three pages on the tokens; inline errors; focus order; the guest link.
- [ ] Verify: `npm run verify`; sign in, sign up (a throwaway address) and the guest start in
      the browser; `npm run shots` at 1440 and 390.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Auth pages and the guest start on the new base

## Context
`/login`, `/signup` and `/get-started` look like the product (design §10): the wordmark, a
serif line, the two fields, the primary button, inline errors, the guest link, and the shimmer
while a guest session starts.

## Plan
- [x] One `AuthForm` for sign-in and sign-up: the wordmark, one line, email and password with
      autocomplete, errors under their field and focus on the first, a plain form-level
      error for a wrong password, "Check your email" when sign-up needs confirmation, the
      link to the other page, the guest way in.
- [x] `/get-started` out of the auth layout: a signed-in visitor goes straight to the Studio
      with the landing prompt (the auth layout used to drop it); everyone else gets a guest
      session and the same prompt.
- [x] The auth layout sends a signed-in visitor to `/studio`; `SubmitLoader`, `Loader`,
      `TypingDots` and the old schema file deleted.
- [x] Verify: `npm run verify`; the flows below in the browser; screenshots at 1440 and 390.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built and tested. Found while here: a signed-in visitor lost the landing prompt at `/get-started`.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-013 (command palette)
- **Read first:** `components/auth/auth-form.tsx`, `app/get-started/*`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, tests pass
playwright:
  /login empty submit → focus on email, its error shown
  a wrong password → "That email and password do not match. Try again, or create an account."
  signed out /get-started?prompt=a poster for a jazz night&mode=image → /studio with the field filled
  signed in /get-started?prompt=hello again → /studio?prompt=hello again
  signed in /login → /studio; 390 scrollWidth 390; no page errors
```
Not run: a real sign-up (it would create an account on the production auth project).

## Outcome
Shipped: the auth pages and the guest start on the new base, the landing prompt kept for
signed-in visitors, the old loaders removed. No new tickets.
