# TICKET-038: Guests leave nothing behind; curated examples in their recents

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
The guest account is shared by every visitor, so nothing a guest makes may be stored where
the next guest can see it. Guests get a curated set of example sessions in Recents (and their
outputs in the library) instead of each other's work.

## Context
- The owner (2026-10-11): "Do we save sessions from the guest? we shouldn't because the guest
  account can be shared by multiple users right, we should have some tailor made in the
  recents but not save guests actual sessions as people might search anything and other users
  shouldn't see that".
- Today (read): `app/api/agent/route.ts` and `app/api/generate/route.ts` create and save a
  `Session` for any caller (`ensureSession`, `renameSession`, `saveMessages` in
  `lib/sessions.ts`); the tools (`lib/ai/tools.ts`) and the generate route write an `Asset`
  per output (`recordAsset` in `lib/assets.ts`); `app/api/chat/[chatId]/route.ts` writes the
  guest's character messages and `app/(app)/characters/c/[id]/page.tsx` loads them back.
  `listSessions` shows the guest the last day's sessions plus pinned ones; the library lists
  every guest asset. `app/api/housekeeping/route.ts` deletes guest rows older than a week.
  Guest rows in the database now: 4 sessions (none pinned), 7 assets, 2 character messages.
- The same widening applies to the library and character chats as to sessions: the owner's
  reason (other guests must not see what someone typed or made) covers all three, so all
  three are in scope.
- Guest detection: `lib/guest-user.ts` (`GUEST_USER_ID`). `Session.pinned` already marks an
  example that guests cannot delete. Message shape (read from a saved run): a user message
  with a text part; an assistant message with `step-start`, tool parts
  (`tool-generate_image` output `{ urls, prompt }`, video, music and sound `{ url, prompt }`)
  and a closing text part. `components/studio/outputs.tsx` renders those.
- The Studio client (`app/(app)/studio/studio-client.tsx`) gives a new session its URL on the
  first send and offers rename and delete; `app/(app)/studio/page.tsx` and
  `app/(app)/studio/[id]/page.tsx` render it. The library (`app/(app)/library/page.tsx`,
  `components/library/library-client.tsx`, `lightbox.tsx`) toggles favourites. Settings
  (`app/(app)/settings/page.tsx`) tells guests their work is shared and kept a week.
- Ruled out: deleting the existing guest rows by hand (irreversible on the shared database);
  they are hidden from every read now and the daily cleanup removes them.

## Plan
- [x] `isGuestId(userId)` in `lib/guest-user.ts`.
- [x] Storage refuses guest writes and limits guest reads to pinned examples:
      `ensureSession`/`renameSession`/`saveMessages` no-ops for the guest; `listSessions` and
      `getSession` return only pinned rows; `recordAsset` returns an unsaved record;
      `listAssets`/`getAsset` only assets of pinned sessions; `setFavorite`/`deleteAsset`
      no-ops. The agent and generate routes run guests unsaved (no session id).
- [x] Character chats: the guest's messages are neither saved nor loaded.
- [x] Studio for a guest: no session URL on first send, no recents refresh, no rename or
      delete on an example. Library and lightbox for a guest: no favourite control.
- [x] Settings copy for the guest; housekeeping deletes every non-pinned guest session, every
      guest asset outside a pinned session and every guest character message, daily.
- [x] Curated examples: `lib/guest-examples.ts` (four sessions built from `public/landing`
      media: the forest brief, the owl and the aurora, the dawn chorus with a dew drop, the
      whale), a unit test that every file it names exists, and `scripts/guest-examples.mjs`
      that upserts them as pinned guest sessions with their assets (fixed ids, idempotent).
      Run it once.
- [x] Design doc §12 (data) and §9 (settings); screens of the guest's Studio, Recents, an
      example, the library and Settings; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `isGuestId` in `lib/guest-user.ts`. `lib/sessions.ts`: guest reads limited to pinned rows (`listSessions`, `getSession`), `saveMessages`/`renameSession`/`deleteSession` no-ops, `ensureSession` throws for the guest (callers never reach it). `lib/assets.ts`: `recordAsset` returns an unsaved record for the guest; `listAssets`/`getAsset` only assets of pinned sessions; `setFavorite`/`deleteAsset` no-ops. The agent and generate routes pass no session id for the guest; the chat route skips saving and the chat page loads no history for the guest. Studio: no address or Recents refresh on a guest's first send, no rename or delete. Library and lightbox: `readOnly` for the guest (no favourites, no delete). Settings copy. Housekeeping: daily, every non-pinned guest session, every guest asset outside a pinned session, every guest character message.
- 2026-10-11 — Examples: `lib/guest-examples.json` (+ typed `lib/guest-examples.ts`, test `lib/guest-examples.test.ts`), four sessions from `public/landing` media; `scripts/guest-examples.mjs` ran once: 4 pinned sessions, 8 assets. The 4 old guest sessions, 7 assets and 2 messages are hidden from every read and go at the next cleanup.

## Verification
As the guest in a browser: Recents list exactly the four examples; an example renders its
outputs with no rename or delete; the library shows the eight curated outputs with no
favourite controls; Settings shows the new copy; no page errors. A real guest image request to
`/api/generate` with a fresh uuid streamed its image back, then `GET /api/sessions/<id>` was
404, Recents were unchanged, and the database counts were identical before and after
(4 pinned, 8 pinned assets, 4 hidden sessions, 7 hidden assets, 2 messages).

```
npm run verify    # lint, typecheck, check:tickets, 34 unit tests (3 new): passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the shared guest account stores nothing a guest makes, and guests see
four curated examples in Recents and the library. Left for the owner: the daily cleanup that
removes the old guest rows runs on Vercel Cron and needs `CRON_SECRET` set there (the step is
already noted for the deploy); until then those rows are hidden but present. No follow-ups.
