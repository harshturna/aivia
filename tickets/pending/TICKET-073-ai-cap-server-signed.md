# TICKET-073: The editor's AI tools behind the server's cap

**Status:** pending
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
- [ ] `/api/edit/run`: guard, signed copy, signed transformation, wait, refund on failure;
      the client calls only it; the unsigned preset no longer used.
- [ ] Owner step written in the Outcome: turn on strict transformations, then check an
      unsigned derived URL is refused.
- [ ] `isEditableUrl` on the normalised URL, used in the schema and on reopen; claim returns
      the kept ids and the client clears only those; caps on edits and uploads per user;
      deleting an asset removes its stored file.
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2). Each fixed finding gets a test that fails before the fix
      where it can be tested.
- [ ] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan.
- **Read first:** this ticket.

## Verification

## Outcome
