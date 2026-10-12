# TICKET-064: Edits and storage

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** infra

## Goal
The `Edit` table and API, `Asset.parentAssetId`, Supabase Storage for uploads and exports by signed upload (replacing the 4 MB cut body), guest edits in the browser and their claim.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Reads: `prisma/schema.prisma`, `app/api/cuts/route.ts`, `lib/guest-local.ts`, `lib/claim.ts`, `app/api/claim/route.ts`.
- Done with the owner's yes (chat, 2026-10-11), both additive, on the live database:
  `prisma db push` (enum `EditKind`, table `Edit`, `Asset.parentAssetId`; `relationMode =
  "prisma"`, so no foreign keys, as before) and a storage script through the same connection:
  a public `media` bucket (100 MB a file; mp4, webm, jpeg, png, webp) and two policies on
  `storage.objects` (a signed-in user inserts and deletes only under `media/<their id>/`; the
  guest cannot insert). Checked: the bucket answers "Object not found" for a missing file; the
  schema diff is empty.
- Uploads go from the browser with the user's own Supabase session (no service key), then the
  server checks the address (our bucket, the caller's folder) and the file's first bytes before
  recording an Asset. This replaces `/api/cuts` and its 4 MB body (the Cut dialog moves to it).
- Files: `prisma/schema.prisma`, new `lib/edits.ts` (+ test), new `app/api/edits/route.ts` and
  `app/api/edits/[id]/route.ts`, new `lib/storage.ts` (browser upload) and
  `app/api/uploads/route.ts` (finish an upload: check and record), `components/studio/cut.tsx`
  (save through it), `app/api/cuts/route.ts` (goes), `lib/guest-local.ts`, `lib/claim.ts` and
  `app/api/claim/route.ts` (guest edits).

## Plan
- [x] Schema and storage (above).
- [x] `lib/edits.ts`: list by project, get, create, save with `rev` (409 on a stale rev),
      delete; the guest writes nothing; documents read through `migrate` and capped at 200 KB.
- [x] `/api/edits` (GET `?project=`, POST) and `/api/edits/[id]` (GET, PUT `{doc, rev}`,
      DELETE).
- [x] `lib/storage.ts` uploads a Blob to `media/<user>/<uuid>.<ext>`; `/api/uploads` checks
      the address and the first bytes (ftyp, EBML, JPEG, PNG, WebP) and records the Asset (kind,
      session, title, length, `parentAssetId`, the edit it came from); the Cut dialog keeps cuts
      this way, without the 4 MB cap; `/api/cuts` is deleted.
- [x] The guest: up to five edits in the browser; `/api/claim` takes `edits` too (migrated,
      addresses filtered, deterministic ids, project ids mapped to the claimed sessions).
- [x] Tests: edits (rev conflict, guest refusal, size), upload path checks, claim of edits.
- [x] Verify: `npm run verify`; the API by HTTP as the guest (refused writes) and the routes'
      checks in tests; the Cut dialog's keep path cannot be exercised without an account, so
      the upload is tested against a Supabase session in a unit-level fake; `npm run test:e2e`.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; schema and storage applied with the owner's yes.
- 2026-10-11 — Built. Image edits are not accepted by `/api/edits` yet: their document comes
  with TICKET-067, so `checkDoc` takes cuts only. A first end-to-end run, started while verify
  was compiling, stalled for 30 minutes and failed two phone sign-in checks; run alone it
  passed in full.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-065.
- **Read first:** nothing

## Verification
```
live database (owner's yes): prisma db push → "in sync, 2.70s"; storage script → executed;
  public/media/missing → "Object not found" (no such bucket → "Bucket not found");
  migrate diff after → no difference
npx vitest run lib/edits.test.ts lib/claim.test.ts lib/upload-check.test.ts
  edits: rev conflict refused, owner scoping, guest writes nothing, doc checks and size cap;
  claim: edits parsed, unsafe media dropped, junk refused, edit ids distinct and stable;
  uploads: own folder only, our names only, signatures read
node .audit/t064/http.mjs
  signed out: GET /api/edits 401, POST /api/uploads 401
  guest: GET /api/edits 200 [], POST 403, PUT 404, POST /api/uploads 403
  storage, with the guest's own token: upload into its folder refused by row-level security
npm run verify     # 106 unit tests: pass
npx playwright test   # 37 passed, 1 skipped
```
Not exercised: a signed-in account's upload succeeding and becoming a library piece (no
non-guest account here). It needs the owner's real-account pass on the live site.

## Outcome
Shipped: the `Edit` table and `Asset.parentAssetId` on the live database, a `media` storage
bucket with per-user policies, `lib/edits.ts` and `/api/edits` (rev-checked saves),
browser uploads to storage and `/api/uploads` (address and signature checked), the Cut dialog
saving that way without the 4 MB cap (`/api/cuts` deleted), and guest edits in the browser with
their claim. Left out: image edit documents (TICKET-067).
