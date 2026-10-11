# TICKET-047: Drop the guest cleanup cron

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** infra

## Goal
Remove the daily guest cleanup job and its `CRON_SECRET`. The guest account no longer saves
anything, so the job would only clear pre-revamp leftovers once and then do nothing forever.
Those leftovers are deleted by hand, once, after the merge.

## Context
- The job: `app/api/housekeeping/route.ts` (TICKET-005, widened in TICKET-038) deletes
  unpinned guest sessions and assets and every guest character message. It is protected by
  Bearer `CRON_SECRET` and scheduled by `vercel.json` (daily, 09:00 UTC). `vercel.json` exists
  only for this cron and is not on `main`. `proxy.ts` excludes `api/housekeeping` from its
  session refresh matcher.
- Since TICKET-038 and TICKET-041 the guest writes nothing to the database. Checked
  2026-10-11: `lib/assets.ts` `recordAsset` returns an unsaved row for the guest;
  `app/api/agent/route.ts` never gives the guest a session id; `app/api/cuts/route.ts`
  refuses the guest; `app/api/chat/[chatId]/route.ts` skips `message.createMany` for the
  guest. Reads already show the guest only pinned sessions and their assets
  (`lib/sessions.ts`, `lib/assets.ts`), so the old rows are invisible.
- Owner decision (chat, 2026-10-11): drop the cron, delete the leftovers manually once.
  The manual delete waits for the merge, because `main` still writes guest rows until then,
  and needs the owner's confirmation since it deletes rows from the live database.
- No other references: grep finds `housekeeping` and `CRON_SECRET` only in the files above
  and in closed tickets (005, 038), which stay as history.

## Plan
- [x] Delete `app/api/housekeeping/route.ts` and `vercel.json`.
- [x] Drop `api/housekeeping` and "the cron (a secret)" from the `proxy.ts` matcher.
- [x] Verify: `npm run verify`; grep shows no live reference.

## Progress log
- 2026-10-11 — Ticket written and started.
- 2026-10-11 — Route, `vercel.json` and the proxy exclusion removed. The one-time delete of
  the leftovers is TICKET-048, pending until the merge.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-048 after the merge.
- **Read first:** nothing

## Verification
```
npm run verify          # lint, typecheck, tickets, 69 unit tests: all pass
grep -rn "housekeeping\|CRON_SECRET" --exclude-dir={node_modules,.next,.git,tickets} .
                        # no matches
```

## Outcome
Shipped: the guest cleanup route, its daily schedule (`vercel.json`, now gone) and its proxy
exclusion are removed, so `CRON_SECRET` is no longer needed in Vercel. Left out: deleting the
existing guest leftovers, which waits for the merge (TICKET-048).
