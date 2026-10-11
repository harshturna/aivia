# TICKET-064: Edits and storage

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** infra

## Goal
The `Edit` table and API, `Asset.parentAssetId`, Supabase Storage for uploads and exports by signed upload (replacing the 4 MB cut body), guest edits in the browser and their claim.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060. Waits for the owner's approval of the §17 design.
- Reads: `prisma/schema.prisma`, `app/api/cuts/route.ts`, `lib/guest-local.ts`, `lib/claim.ts`, `app/api/claim/route.ts`.
- A schema change on the live database: `prisma db push` needs the owner's yes at the time.

## Plan
- [ ] Schema: `Edit`, `Asset.parentAssetId`; push with the owner's yes.
- [ ] `/api/edits` (create, get, save with rev, delete); storage bucket and signed uploads.
- [ ] Guest edits local; claim extended; tests.
- [ ] Landing: none.
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2).
- [ ] Verify: `npm run verify`, `npm run test:e2e` (with the in-use checks), Playwright in use
      at 1440, 1024 and 390, `npm run shots` (with states), web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.

## Handoff
- **State:** not started.
- **Blocked on:** the owner's approval of D-005 / §17.
- **Next:** plan from §17.
- **Read first:** `docs/design/revamp.md` §17.

## Verification

## Outcome
