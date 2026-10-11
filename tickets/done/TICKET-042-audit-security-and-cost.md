# TICKET-042: Audit fixes, security and cost

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Fix the security and cost findings of the five-reviewer audit of 2026-10-11: no server-side
request forgery, no free generations, no race past a limit, no guest at checkout, no way to
lock the demo for everyone, hardened claim and cut routes, and uploads that fit Vercel.

## Context
- The owner (2026-10-11): "Go for it, or if you think you want to do an audit with some sub
  agents to look at all that's been implemented so far, to look for any issues, bugs, or any
  problems etc, do that too". Five read-only opus reviewers ran (security, Studio flows,
  landing, design and accessibility, API and tests); I verified each finding below in the
  code before planning. Studio, landing and design findings are TICKET-043, 044, 045.
- Verified:
  1. SSRF: `publicImageUrl` (`lib/ai/fal.ts`, read) checks only `startsWith("/")`;
     `new URL("//evil.com/x", origin)` and `"/\\evil.com/x"` resolve to evil.com (checked in
     node). The server fetches (following redirects) and uploads the body to fal storage.
  2. Free generations: `app/api/generate/route.ts` (read) charges in the stream's `onFinish`
     when `succeeded`; on a client cancel the AI SDK calls `onFinish` at once, before the run
     resolves, so nothing is charged while fal still bills and `recordAsset` still saves. The
     agent and chat routes charge in `streamText`'s `onFinish`, which a cancel skips.
  3. Race and cost blind spots: `lib/ai/guard.ts` (read) checks, then increments after the
     stream (`lib/api-limit.ts`, `lib/hard-limit.ts`, read); parallel requests all pass, and
     `checkHardLimit` ignores the request's cost. The hard cap never resets, though the copy
     says "today's limit".
  4. `lib/actions.ts` (read) exports `incrementLimit` and `didLimitReach` as public server
     actions; `components/edit/workspace.tsx` (read) calls them from the browser, so anyone
     signed in can push the shared guest's cap to its limit and stop the demo.
  5. `app/api/stripe/route.ts` (read) does not refuse the guest.
  6. `app/api/claim/route.ts` and `lib/claim.ts` (read): no transaction, not idempotent,
     unbounded assets per session, a malformed body throws (500).
  7. `app/api/cuts/route.ts` (read): trusts the declared type, no try/catch on upload,
     `Number(null)` saves 0 seconds; Vercel caps request bodies at about 4.5 MB.
  8. Attachments are sent as data URLs in every request (`app/(app)/studio/studio-client.tsx`,
     read); a photo over about 3 MB breaks the session on Vercel.
  9. `?local=` is honoured for signed-in users (`app/(app)/studio/page.tsx`, read); a stale
     link reaches `ensureSession` on an id the guest owns and 500s on the unique key.
  10. The agent's tools (`lib/ai/tools.ts`, read) allow 20 s video and unbounded calls per run
      while a run is charged as one; changing what a run costs is the owner's call, so this
      ticket caps the run instead and records the question.
- Ruled out here: signed Cloudinary transformations for Edit (a larger change, the unsigned
  preset is pre-existing); a CSRF origin check across all routes (low, recorded as a
  follow-up in the outcome).

## Plan
- [x] Guard: reserve the cost atomically when the request arrives (conditional updates on
      `UserApiLimit`, the hard cap counting the request's cost and resetting each UTC day),
      refund only when nothing was made. Generate refunds on a failed run; agent and chat keep
      the charge once streaming starts. Remove the old check and increase helpers.
- [x] Edit spends through `POST /api/edit/spend` (the guard); delete `lib/actions.ts`.
- [x] `publicImageUrl`: only `/landing/<file>` paths, no redirects, an image type, a size cap;
      data URLs capped. Tests.
- [x] Agent tools: video at most 10 s, at most six outputs per run.
- [x] Stripe refuses the guest.
- [x] Claim: type guards, at most 40 assets per session and 2 kB per URL, deterministic ids
      per user and local id so a retry cannot duplicate, one transaction, 400 on bad input.
- [x] Cuts: magic bytes, try/catch, sane seconds, a clear message over the platform limit; the
      dialog keeps cuts under it (bitrate) and says so when one is too large to keep.
- [x] Attachments: downscale images before sending; older messages travel without data URLs.
- [x] `?local=` only for the guest; `ensureSession` collisions run unsaved instead of 500.
- [x] Tests for the guard's reservation, the URL rule, the claim rules; `npm run verify`,
      `npm run test:e2e`; a real abort check that the charge stays.

## Progress log
- 2026-10-11 — Opened from the audit; findings verified in the code.
- 2026-10-11 — Built: `lib/usage.ts` `reserve()` (conditional `updateMany` on `UserApiLimit`: the daily reset when `updatedAt` is before today's UTC start, the cap reserved with `hardLimitCount <= cap - cost`, the free allowance with `count <= free - cost`, a one-shot refund), 5 tests with an in-memory fake. `lib/ai/guard.ts` reserves and returns `refund`; generate refunds a failed run and errors before streaming; agent and chat refund only before streaming (chat also on a missing character). `lib/hard-limit.ts`, `lib/actions.ts` and the old check/increase helpers deleted; Edit spends through `POST /api/edit/spend`. `lib/ai/image-url.ts` `classifyImageUrl` (3 tests) behind `publicImageUrl` (no redirects, image type, 10 MB). Agent: video at most 10 s, `MAX_RUN_OUTPUTS` 6 per run. Stripe refuses the guest (and its return URL is `/settings`). Claim: `lib/claim.ts` rewritten with type guards, 40 assets and 2 kB URLs per session, `claimedSessionId` (stable uuid per account and browser id), the route skips sessions it already made and writes the rest in one transaction (3 more tests). Cuts: 4 MB cap with a clear 413, magic bytes, upload try/catch, sane seconds; the encoder at about 2.5 Mbps and the dialog explains a cut too long to keep. Studio: photos downscaled to 1600 px JPEG before sending, earlier messages sent without data URLs. `?local=` only for the guest; session id collisions run unsaved.

## Verification
The cancel fix, for real: the guest's `hardLimitCount` was 61; a guest image request to
`/api/generate` aborted after 1 s (`AbortError`); 20 s later the count was 62. Before this
ticket the charge sat in the stream's finish callback and a cancel skipped it.

```
npm run verify    # lint, typecheck, check:tickets, 59 unit tests (11 new): passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: usage reserved atomically up front with a daily cap (no free generations
by cancelling, no race past a limit, cost counted against the cap); no server-side request
forgery; Edit spends through the guard and nobody can lock the demo through a public action;
guests cannot reach checkout; the claim and cut routes are hardened; uploads stay under the
platform limit. Left for the owner: whether an Auto run should cost per piece instead of one
generation (capped at six pieces meanwhile). Recorded, not done: an Origin check on mutating
routes against sibling subdomains (low), signed Cloudinary transformations for Edit (the
unsigned preset predates the revamp). Next: TICKET-043 (Studio and guest correctness).
