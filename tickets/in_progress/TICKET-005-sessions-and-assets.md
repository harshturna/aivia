# TICKET-005: - [ ] Schema, `prisma db push`, `prisma generate`; `lib/sessions.ts`, `lib/assets.ts` with
      unit tests for the ownership guards and the day grouping helper.
- [ ] Tools write assets; the agent route loads, saves and names sessions; `/studio/[id]`
      resumes a session (the page passes `initialMessages`).
- [ ] The four routes; the sidebar recents and "All sessions" read them.
- [ ] Housekeeping route and the cron entry in `vercel.json`.
- [ ] Verify: `npm run verify`; a run in the browser produces a Session and Assets (checked
      in the database); reload resumes it; a second account cannot read it (curl with the
      wrong session: 404).

**Status:** in-progress
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** —
**Area:** feature

## Goal
Sessions and assets persisted

## Context
What a user makes is kept: a `Session` row per Studio conversation holding its messages, an
`Asset` row per generated image, video, music or sound, written by the tools themselves, with
the routes the Studio, the sidebar and the library read from (design §12).

## Plan
- Design §12 (data), §4 (recents), D-002.
- Files: `prisma/schema.prisma` (two models, indexes, full-text on `Asset.prompt`),
  `lib/ai/tools.ts` (each `execute` writes an Asset; it needs the user id and session id,
  passed through `experimental_context` or a closure built per request), `app/api/agent/route.ts`
  (loads or creates the Session, saves messages in `onFinish`, names the session on the first
  turn with `claude-haiku-5-5`), new `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`,
  `app/api/assets/route.ts`, `app/api/assets/[id]/route.ts`, `lib/sessions.ts`, `lib/assets.ts`.
- `prisma db push` against the configured database: additive only; the two tables are new, no
  column of an existing table changes. Run once locally, then on the owner's say for
  production if `DATABASE_URL` points elsewhere (check before running).
- Guest rows: all guests share one user id; sessions list only the last day's for a guest,
  and a route `POST /api/housekeeping` (secret-keyed, called by a Vercel cron daily) deletes
  guest rows older than seven days.
- Asset URLs are fal's. Routine choice: store them as returned; a follow-up ticket mirrors to
  Cloudinary if they expire. Record the first expiry seen.
- Ownership: every read and write is scoped by `userId`; a guest cannot delete the example
  session (it is marked `pinned`).
- Ruled out: storing messages per row (the AI SDK's `UIMessage[]` is the unit the client
  needs, as one JSON column); embeddings or vector search (full-text on the prompt is enough).

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-10 — Started after TICKET-004. Schema, libraries, the tool factory written; the push blocked on the pooler port; session ended on the owner's usage limit with the work committed as is.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** written but not applied: the `Session` and `Asset` models are in
  `prisma/schema.prisma` (validated, NOT pushed: `prisma db push` hangs on the transaction
  pooler, port 6543 with `pgbouncer=true`; run it with `DATABASE_URL` rewritten to port 5432
  and without the query string); `lib/sessions.ts`, `lib/assets.ts` and `lib/assets.test.ts`;
  `lib/ai/tools.ts` is now a factory `createAgentTools({ userId, sessionId })` that records
  every result as an Asset, and the agent route calls it with no session yet. Prisma client
  not regenerated, so `tsc` fails on the new models until `npx prisma generate` runs after
  the push.
- **Blocked on:** the push (see State); the owner's usage limit ended the session here.
- **Next:** push through port 5432, `npx prisma generate`, `npm run verify`; then the agent
  route takes `sessionId` from the body, `ensureSession` + `saveMessages` in `onFinish`
  (`toUIMessageStream` has `originalMessages` and `onFinish`), the title from
  `titleFromBrief`; `/api/sessions`, `/api/sessions/[id]`, `/api/assets`, `/api/assets/[id]`;
  housekeeping; the sidebar's recents; `/studio/[id]`.
- **Read first:** `docs/design/revamp.md` §12, `prisma/schema.prisma`, `lib/ai/tools.ts`,
  `app/api/agent/route.ts`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
