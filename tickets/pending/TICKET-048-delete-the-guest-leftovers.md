# TICKET-048: Delete the guest leftovers once, after the merge

**Status:** blocked
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** infra

## Goal
Delete, once, the rows the shared guest account saved before the revamp. The revamp saves
nothing for the guest and shows it only pinned examples, so these rows are dead weight.

## Context
- Follows TICKET-047, which removed the daily cleanup job in favour of this one-time delete.
- Blocked on the merge of `revamp` into `main`: until then the live site's old code still
  writes guest rows.
- Deletes rows from the live database, so the owner confirms before it runs.
- The delete is what the removed route did (`git show 5fa482b:app/api/housekeeping/route.ts`),
  for `userId = GUEST_USER_ID` in one transaction: assets with no session or an unpinned
  session; unpinned sessions; every character `Message`. Pinned example sessions and their
  assets stay.

## Plan
- [ ] Count the rows first and report them to the owner.
- [ ] On the owner's yes, run the delete in one transaction through Prisma against the
      database in `.env` (port 5432).
- [ ] Verify: the counts are zero and the pinned examples still load on the live site.

## Progress log
- 2026-10-11 — Written from TICKET-047.

## Handoff
- **State:** not started; waits for the merge.
- **Blocked on:** the merge to `main`.
- **Next:** count the rows, ask the owner, delete.
- **Read first:** this ticket.

## Verification

## Outcome
