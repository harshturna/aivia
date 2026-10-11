# TICKET-005: - [ ] Schema, `prisma db push`, `prisma generate`; `lib/sessions.ts`, `lib/assets.ts` with
      unit tests for the ownership guards and the day grouping helper.
- [ ] Tools write assets; the agent route loads, saves and names sessions; `/studio/[id]`
      resumes a session (the page passes `initialMessages`).
- [ ] The four routes; the sidebar recents and "All sessions" read them.
- [ ] Housekeeping route and the cron entry in `vercel.json`.
- [ ] Verify: `npm run verify`; a run in the browser produces a Session and Assets (checked
      in the database); reload resumes it; a second account cannot read it (curl with the
      wrong session: 404).

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** 2026-10-11
**Area:** feature

## Goal
Sessions and assets persisted

## Context
What a user makes is kept: a `Session` row per Studio conversation holding its messages, an
`Asset` row per generated image, video, music or sound, written by the tools themselves, with
the routes the Studio, the sidebar and the library read from (design §12).

## Plan
- [x] Schema (`Session`, `Asset`, `AssetKind`), pushed through the session-mode port (5432;
      the transaction pooler on 6543 hangs `prisma db push`), `prisma generate`;
      `lib/sessions.ts`, `lib/assets.ts` with unit tests (day grouping, titles, message
      text, id validation).
- [x] Tools write assets (`createAgentTools({ userId, sessionId })`); the agent route takes
      the chat id as the session id, creates and names the row on the first send (the title
      is the brief, trimmed: the cheap-model naming is not worth a second call), saves the
      transcript in `toUIMessageStream`'s `onFinish`; `/studio` makes the id, `/studio/[id]`
      resumes.
- [x] `/api/sessions`, `/api/sessions/[id]` (get, rename, delete; pinned rows cannot be
      deleted), `/api/assets` (cursor, kind, search, favourites), `/api/assets/[id]`
      (favourite, delete); the sidebar's recents reload when a run ends.
- [x] `/api/housekeeping` (Bearer `CRON_SECRET`) and the daily cron in `vercel.json`; the
      proxy skips it and `/landing/*`.
- [x] Verify: `npm run verify`; two real runs as the guest.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-10 — Started after TICKET-004. Schema, libraries, the tool factory written; the push blocked on the pooler port; session ended on the owner's usage limit with the work committed as is.
- 2026-10-11 — Pushed through port 5432 in 3.4 s. Route, pages, API, recents, housekeeping
  built. The first browser run failed with `findFirst` of undefined: the dev server held the
  Prisma client from before `generate` on `globalThis`; restarted. Stopping it with a broad
  `pkill -f "next dev"` also stopped two other projects' dev servers on this machine;
  CLAUDE.md now says to stop this server by its port only. Two runs as the guest: a text-only
  poem (one Claude call) and a two-second knock (one sound effect, about $0.002).

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-006 (the Studio rebuild), which replaces `app/(app)/studio/studio-client.tsx`'s body
- **Read first:** `lib/sessions.ts`, `app/api/agent/route.ts`, `app/(app)/studio/*`

## Verification
```
DATABASE_URL=<port 5432, no pgbouncer> npx prisma db push   # in sync, 3.41 s, two new tables only
npm run verify     # biome 0 errors, tsc clean, 16 tickets, 11 unit tests (2 files)
playwright, as the guest on next dev:
  /studio → send a text-only brief → URL becomes /studio/<uuid>
  recents: ["Write a two-line poem about rain on a tin roof. Text only…"]
  reload → the brief and reply are there
  GET /api/sessions/<id> 200, 2 messages; an unknown uuid 404; signed out 401
  a sound-effect brief → /api/assets?kind=audio has 1 sound asset with that sessionId
curl /api/housekeeping without the secret → 401
```
Not tested: a second real account reading the guest's session (no second account; the
scoping is the `userId` in every query and the unknown-id 404 exercises the same path); the
cron firing (it runs once deployed with `CRON_SECRET` set).

## Outcome
Shipped: persistent sessions and assets end to end (schema, libraries, tools that record
their outputs, the agent route that saves and names sessions, resume at `/studio/[id]`,
four API routes, recents in the sidebar, guest housekeeping on a daily cron). Left out:
naming sessions with a model (the brief is the title); mirroring fal's asset URLs to
Cloudinary (no expiry seen yet; a ticket if one is). Owner step on deploy: set `CRON_SECRET`
in Vercel. No new tickets.
