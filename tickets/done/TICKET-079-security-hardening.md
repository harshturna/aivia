# TICKET-079: Security hardening from the review

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Close the security review's minor findings that need no new secret: addresses checked after normalising and wherever a doc or asset is reopened, a claim that clears only what it kept, per-account caps on edits and kept files, and a deleted piece's file removed.

## Context
- From the security review (2026-10-11), findings 3, 5, 7, 10, 11; split from TICKET-073, which
  is blocked on the Cloudinary secret (signing, refunds and the storage policy stay there).
- `lib/image-edit/sources.ts:19`: the prefix is checked on the raw string and `..` on the
  resolved path, so `.../public/media/%2e%2e/other/x.png` passes (verified live by the reviewer).
- `lib/image-edit/schema.ts:22` accepts any URL (`javascript:` passes zod's `url()`);
  `app/(app)/p/[id]/edit/page.tsx` reopens a doc's source and an asset's address unchecked.
- `app/api/claim/route.ts`: with 20 claimed sessions held, `fresh` is empty, the route answers
  200, and `lib/guest-local.ts` `claimLocalSessions` clears every local session.
- No cap on edit rows (`lib/edits.ts` `createEdit`) or recorded uploads (`app/api/uploads`).
- `lib/assets.ts` `deleteAsset` leaves the stored file; the storage policy "media: delete from
  your own folder" lets the user's own session delete it (`lib/supabase/server.ts`).
- Files: `lib/image-edit/sources.ts` (+test), `lib/image-edit/schema.ts`,
  `app/(app)/p/[id]/edit/page.tsx`, `app/api/claim/route.ts`, `lib/guest-local.ts`,
  `lib/edits.ts`, `app/api/edits/route.ts`, `app/api/uploads/route.ts`, `lib/assets.ts`,
  `app/api/assets/[id]/route.ts`, `lib/upload-check.ts`.

## Plan
- [x] `isEditableUrl(url, storageBase, appOrigin?)`: decide on the normalised href; the app's
      own `/landing/` files by its origin. Tests for the encoded `..`.
- [x] The image-edit schema refines every address with it; the edit page checks a reopened
      doc's source and an asset's address, and goes back to the project otherwise.
- [x] Claim answers with the local ids it kept; the client removes only those.
- [x] `MAX_EDITS = 500` per account on create (and claim); `MAX_KEPT = 500` recorded uploads.
- [x] Deleting an asset whose file is ours, in the caller's folder, removes the file too.
- [x] Verify: `npm run verify`; `npx playwright test` alone; a live probe of the encoded `..`.

## Progress log
- 2026-10-11 — Written from the review and TICKET-073's split; started.
- 2026-10-11 — Built. `isEditableUrl` decides on `new URL(...).href` (dot segments, encoded or
  not, are resolved first) and takes `/landing/` files by the app's own origin; the image-edit
  schema refines every address with it (by `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_APP_URL`);
  the edit page checks the source, a reopened doc's source and an asset's address by the
  request's origin. Claim answers `keptLocal`; the client removes only those
  (`removeLocalSessions`). Caps: 500 edits per account (create and claim), 500 kept files per
  account (`/api/uploads`). Deleting an asset removes its file when it is ours and in the
  caller's folder (`storagePath` + `checkPath`), with the caller's own session.

## Verification
- Units: `lib/image-edit/sources.test.ts` (4: encoded and plain `..` refused, the app's origin
  only), `lib/image-edit/image-edit.test.ts` (javascript:, a metadata IP and a foreign host
  refused by the schema), `lib/upload-check.test.ts` (`storagePath` refuses an encoded `..` and
  foreign hosts), `lib/guest-local.test.ts` (a claim that kept one of two leaves the other).
- Live probe as the guest (`.audit/t072/probe.mjs`): `?src=` with the encoded `..` storage path,
  another bucket, and `javascript:` each went back to the project; before, the first opened the
  editor (the reviewer's finding).
- `npm run verify`: lint, typecheck, ticket check (79), 160 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.
- Not exercised: a signed-in delete removing its stored file, and the caps at 500 (no
  non-guest account here); both are reached only through the code paths above.

## Outcome
Shipped: addresses checked after normalising, in the schema and on every reopen; a claim that
lets go only of what the account took; per-account caps on edits and kept files; a deleted
piece's stored file removed.

Left out (in TICKET-073, blocked on the Cloudinary secret): signed AI requests, refunds for a
result that never arrives, and a storage policy capping objects per user.
