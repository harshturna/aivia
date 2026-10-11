# TICKET-057: Step through the lightbox without a flash

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Previous and next in the library lightbox (TICKET-053) flash the whole page: each step is a
route change, so the modal's loading skeleton replaces the dialog and the new dialog replays
its fade-in. The owner saw it on the dev server (chat, 2026-10-11). Stepping should swap the
item inside the open dialog, instantly.

## Context
- `components/library/lightbox.tsx`: `go(id)` calls `router.replace('/library/a/' + id)`; the
  intercepted route (`app/(app)/library/@modal/(.)a/[id]/page.tsx`) re-renders on the server,
  its `loading.tsx` shows meanwhile, and the remounted overlay runs `animate-in fade-in-0`.
- `app/api/assets/[id]/route.ts` has PATCH and DELETE; no GET. `lib/assets.ts` has `getAsset`
  and `getNeighbors`.
- Approach: a GET returning the asset and its neighbours; the lightbox keeps the item in
  state, swaps it on a step, writes the address with `history.replaceState` (the App Router
  keeps in step with it), and fetches and preloads both neighbours ahead so a step is instant.
- Ruled out: dropping the modal `loading.tsx` alone (the remount and the server round trip
  would still blink).

## Plan
- [x] `GET /api/assets/[id]` → `{ asset, prev, next }`, signed-in users only.
- [x] Lightbox: the shown item, its neighbours and per-item state (favourite, delete confirm,
      the made date) in state; a step swaps them and replaces the address; neighbours are
      fetched and their media preloaded ahead.
- [x] Verify: Playwright stepping → and ← records no loading skeleton and no remount of the
      dialog (same element), the address follows, Esc still closes to /library;
      `npm run verify`; `npm run test:e2e`.

## Progress log
- 2026-10-11 — Ticket written and started.
- 2026-10-11 — Built. The first steps still waited 0.9 to 1.7 s for a neighbour that was not
  loaded yet, so the lightbox now loads two items ahead each way; media elements are keyed by
  the item so a sound's player starts fresh.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** nothing.
- **Read first:** nothing

## Verification
```
node .audit/t053/step.mjs    # modal: → 44 ms, → 35 ms, ← 23 ms; the same dialog element
                             # throughout; no loading skeleton; no server render; Esc → /library
node .audit/t053/step2.mjs   # page view: → swaps the item; a reload opens the stepped-to item
npm run verify               # lint, typecheck, tickets, 82 unit tests: pass
npm run test:e2e             # 37 passed, 1 skipped
```

## Outcome
Shipped: previous and next swap the item inside the open lightbox (or page view) with the
address kept in step, two neighbours each way loaded ahead; no route change, no skeleton, no
replayed fade. `GET /api/assets/[id]` returns an item with its neighbours. Left out: nothing.
