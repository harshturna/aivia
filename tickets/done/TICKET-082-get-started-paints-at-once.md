# TICKET-082: Get started paints at once

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** ui

## Goal
Start making shows the forest and "Opening the Studio…" the moment it is pressed, instead of a black screen for a second.

## Context
- The owner (2026-10-12): from Start making to `/get-started` "it's like all black for a second or
  so, no state at all".
- Cause: `app/get-started/guest-start.tsx` wraps the screen in `<Suspense>` with no fallback because
  it calls `useSearchParams`, so the server sends nothing but the background and the screen only
  appears once the JavaScript has loaded. The page also awaits `getUser` before anything shows.
- Files: `app/get-started/page.tsx`, `app/get-started/guest-start.tsx`, new
  `app/get-started/loading.tsx` and `app/get-started/opening.tsx`.

## Plan
- [x] The page builds the Studio address from its own `searchParams` and passes it to
      `GuestStart`, which no longer reads the URL (no Suspense): the screen is in the first HTML.
- [x] One `Opening` screen (the forest, "Opening the Studio…") shared by the page and a new
      `loading.tsx`, so it shows while the page's server work runs.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the first HTML of `/get-started` holds
      the message; pressing Start making on the landing shows it within a frame or two.

## Progress log
- 2026-10-12 — Written and started from the owner's report.
- 2026-10-12 — Built: the page builds the Studio address from its `searchParams` and passes it as
  `next`; `GuestStart` no longer uses `useSearchParams` or `Suspense`, so its screen is in the first
  HTML. `opening.tsx` holds the backdrop and the message, shared by the page and a new
  `loading.tsx`, which shows while the page checks who is signed in.

## Verification
- `curl http://localhost:3005/get-started?prompt=hello`: the first HTML holds "Opening the Studio"
  and the forest image.
- In the browser (`.audit/t082/click.mjs`): pressing Start making on the landing showed
  `/get-started` with "Opening the Studio…" and the forest drawn 207 ms after the click, and every
  sample after it (screenshot `.audit/t082/early.png`); no black frame.
- `npm run verify`: lint, typecheck, ticket check (82), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.

## Outcome
Shipped: Start making shows the forest and "Opening the Studio…" at once. Not deployed in this
commit; it ships with the next push to `main`.
