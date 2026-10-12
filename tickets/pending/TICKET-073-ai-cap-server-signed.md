# TICKET-073: The editor's AI tools behind the server's cap

**Status:** blocked
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** infra

## Goal
The generative image tools can only run through the server's guard: no client can request a paid transformation without spending, and a result that never arrives costs nothing.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Security review finding 1 (major, pre-existing since TICKET-042, carried into TICKET-067):
  `components/editor/ai.ts` uploads with the unsigned preset `aivia_transformation` and builds
  the transformation URL in the browser; `/api/edit/spend` is a separate, optional call.
- Fix shape: the server copies the base (signed upload), guards, then returns a signed
  transformation URL (`sign_url`); the account turns on "strict transformations" so unsigned
  derived URLs are refused. That dashboard switch is the owner's step.
- Also from the security review: spend only after the result arrives, or refund (finding 6);
  `isEditableUrl` accepts an encoded `..` (`sources.ts:19`, check the normalised href);
  stored doc URLs are not checked (`schema.ts:22` refine with `isEditableUrl`; the edit page
  reopens without checking); claim clears every local session even when none were kept
  (`claim/route.ts:54,118`, `guest-local.ts:153`); no per-user cap on storage objects or edit
  rows, and deleting an asset leaves its file (`lib/storage.ts`, `assets.ts:199`).

## Plan
- [ ] Owner, first: add `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (Cloudinary console,
      Settings, API Keys) to `.env` and to Railway's variables. The server has only
      `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` today, so nothing can be signed.
- [ ] `/api/edit/run`: guard, signed upload of the base, signed transformation URL
      (`sign_url`), the server waits for the result and refunds on failure; the client calls
      only it; the unsigned preset no longer used by the app.
- [ ] Owner, after it ships: Settings, Security, turn on "Strict transformations", and delete
      or restrict the unsigned upload preset `aivia_transformation`; then an unsigned derived
      URL must be refused (check with curl).
- [ ] A per-user cap on storage objects needs a storage policy (live DB change: owner's yes).
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2). Each fixed finding gets a test that fails before the fix
      where it can be tested.
- [ ] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Blocked: the server has no Cloudinary API key or secret (only the public cloud
  name), so signed uploads and signed URLs cannot be built or tested. The hardening that needs
  no secret moved to TICKET-079.

## Handoff
- **State:** not started; blocked.
- **Blocked on:** the owner adding `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- **Next:** plan.
- **Read first:** this ticket.

## Verification

## Outcome
