# TICKET-083: One loading state into the Studio

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** ui

## Goal
Start making goes from the landing to the Studio with one loading state, the Studio's own skeleton, instead of "Opening the Studio…", a black gap and the skeleton.

## Context
- The owner (2026-10-12, live, after TICKET-082): "opening the studio -> the whole black screen ->
  the /studio skeleton, there's three loading states now, it should only be one".
- Recorded on the live site (`.audit/t083/rec.mjs`, `sheet.png`): `/get-started` paints the forest and
  "Opening the Studio…" (0.28–1.67 s) while the browser posts `/api/auth/guest`, then
  `router.refresh()` and `router.push('/studio')`, which shows `(app)/loading.tsx` (1.78–2.01 s)
  before the Studio (2.12 s). On a slower connection the hand-off between the two shows black.
- Fix: the guest's session is made on the server in the same navigation. A new route handler
  `/start` signs the visitor in (the same as `/api/auth/guest`, cookies set on the response) and
  redirects to `/studio` with the prompt; the landing's buttons go there by a full navigation, so
  the landing stays on screen until the Studio paints and the skeleton is the only state between.
  A failed sign-in lands on `/get-started`, which says so with a retry (TICKET-054).
- Files: new `app/start/route.ts`; `app/(landing)/_landing/{nav,sections,your-turn}.tsx`;
  `app/api/auth/guest/route.ts` (read); `app/get-started/*` (kept for the retry and old links).

## Plan
- [x] `/start`: signed in already, straight to the Studio; else sign in as the guest and redirect;
      on failure to `/get-started` with the same query.
- [x] The landing's Start making (nav, close, footer) and its composer go to `/start` with a full
      navigation.
- [x] Verify: `npm run verify`; `npx playwright test` alone; a frame recording from Start making
      shows the landing, then at most the Studio's skeleton, then the Studio; the landing composer's
      prompt arrives in the Studio.

## Progress log
- 2026-10-12 — Written and started from the owner's report and the recording.
- 2026-10-12 — Built: `app/start/route.ts` (GET) signs the guest in with the server's credentials,
  cookies set on the response, and redirects 303 to `/studio` with the prompt, mode and send; a
  signed-in visitor goes straight there; a failed start goes to `/get-started` with the same query.
  The landing's Start making (nav, the close, the footer's Studio) are plain links to `/start`, and
  its composer goes there with `window.location.assign`: full navigations, so the landing stays up
  until the Studio paints. `/get-started` stays for the retry and old links.

- 2026-10-12 — Deployed, and the live check failed: behind Railway's proxy `req.url` is
  `https://localhost:8080`, so `/start` redirected visitors there. `/start` now answers with a
  relative `Location` (`/studio?…`), set with the session cookie.

## Verification
- Frame recording from Start making (`.audit/t083/after/rec.mjs`, `sheet.png`, `sheet2.png`): the
  landing stays on screen through `/start` and the Studio's request, then the Studio's skeleton for
  about 0.3 s, then the Studio; no "Opening the Studio…" screen and no black frame (before: forest
  screen 0.28–1.67 s, the skeleton, and black between on a slow connection).
- `.audit/t083/prompt.mjs`: a brief typed in the landing's composer opened a new project and was sent
  to the Studio ("A lighthouse in a storm"). `/get-started` still answers 200.
- After the proxy fix: `curl -D - http://localhost:3005/start?prompt=hi&mode=image&send=1` answers
  `location: /studio?prompt=hi&mode=image&send=1` with the session cookie.
- `npm run verify`: lint, typecheck, ticket check (83), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.

## Outcome
Shipped: one loading state from the landing into the Studio (its own skeleton). Not deployed in this
commit; it ships with the next push to `main`.
