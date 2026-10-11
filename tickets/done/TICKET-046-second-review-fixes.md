# TICKET-046: Fixes from the pre-merge review

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Fix what the second review (three read-only reviewers over TICKET-043, 044, 045 and 019, and
TICKET-042's guarantees) found, before `revamp` is merged.

## Context
Each finding was checked in the code or reproduced by its reviewer; the SDK behaviour behind
S1, S2 and R1 was read in `node_modules/ai/dist/index.js` (`collectToolApprovals` at 2732,
`convertToModelMessages` `ignoreIncompleteToolCalls` at 10702).
- **S1 (high)** `lib/ai/history.ts` counts only text parts. A forged tool output, a reasoning
  part or a text data-URL file sails past the cap: ~1M input tokens per model step, up to 8
  steps, for one reserved generation.
- **S2 (medium)** An assistant part in `approval-responded` state in client history makes
  `streamText` run that tool before the model is asked (no approval secret set): six videos
  per Auto run, every time.
- **S3 (medium)** `app/api/claim/route.ts`: no cap per account; a loop of claims writes
  unbounded rows.
- **R1 (high)** A stopped Auto run leaves a tool part at `input-available`; every later send
  in that session fails with `AI_MissingToolResultsError`, and each try keeps its charge.
- **R2 (medium)** Video mode with a still and no words: a double click sends twice (two paid
  clips): `busy` is false while `send` awaits image fitting.
- **R3 (medium)** `studio-client.tsx` resets the address on any refusal, not just the first
  send's; a refused first guest send is still saved locally.
- **R4 (medium)** `aivia:claim-pending` overrides an unticked "Bring…" and outlives its
  sign-up (`lib/guest-local.ts`, `auth-form.tsx`, `shell.tsx`).
- **R5 (low)** `lib/ai/plan.ts`: a plan written after a web search is not read as the plan.
- **L1 (medium)** `.hljs` override sits in `@layer base`; github-dark's unlayered rule wins.
- **L2 (low)** Keyboard jump to Pricing draws a clipped ring around the section.
- **L3 (low)** Hero soundtrack resumes ~1 s ahead after another player paused it.
- **L4 (low)** One sound at a time ignores the cut preview's unmuted video.
- Still the owner's: per-piece pricing for Auto runs (TICKET-042). S2's fix removes the forced
  path; the model can still choose six clips in one run.

## Plan
- [x] `lib/ai/history.ts` → `modelHistory`: client history is rebuilt to what the model may
      see (user text and files, data files only on the last brief and capped; assistant text;
      finished media tool calls with input and output cut to their real shape; no reasoning,
      approvals, provider-run search parts or unfinished calls), then capped by its serialized
      size. Agent and chat routes use it; the agent also passes `ignoreIncompleteToolCalls`.
      Tests.
- [x] Claim: claimed sessions marked `mode: "claimed"`, at most 20 per account.
- [x] Studio: a synchronous in-flight guard on `send`; address reset and local-save skip only
      for a refused first send.
- [x] Claim-pending cleared on every sign-in and when there is nothing to claim.
- [x] Plan window ends at the first media tool, not at a search. Test.
- [x] `.hljs` override unlayered and specific; programmatic focus targets without a ring;
      hero clock rebased on any pause; one-sound covers unmuted video.
- [x] `npm run verify`, `npm run test:e2e`; the stopped-run send and double click rechecked in
      Playwright with the routes stubbed.

## Progress log
- 2026-10-11 — Opened from the second review.
- 2026-10-11 — History is rebuilt rather than filtered: the model sees only parts this app
  produces, cut to their real shape, so a forged approval, a giant tool output, reasoning or
  an unfinished call cannot reach it. A history must end on a brief. The claim route returns
  only ids that exist, since capped sessions are not written. A refused send restores the
  address and local copy it found, which covers a guest's example fork as well as a first send.

## Handoff
- **State:** done.
- **Blocked on:** nothing
- **Next:** the owner's call on merging; a Vercel preview and a real-account pass first.
- **Read first:** —

## Verification
```
npm run verify      # lint, typecheck, tickets, 69 unit tests: passed
npm run test:e2e    # 24 passed
```
New unit tests: `lib/ai/history.test.ts` (forged approval, reasoning, search and unfinished
parts dropped; a media call cut to its shape with a 3 MB junk output; pasted files only on the
latest brief and under 8 MB; a stopped run converts to model messages with every call paired
to its result) and `lib/ai/plan.test.ts` (a plan after a web search). Playwright as the guest
with the routes stubbed: a double click on Send with a still and no words in Video mode made
one request; after a first run at `?local=<id>`, a refused second send kept that address; a
refused first send went back to `/studio?mode=image` and saved nothing locally; a
`pre code.hljs` computes a transparent background.

## Outcome
Shipped: the model history rebuilt and capped (`lib/ai/history.ts` `modelHistory`, used by
the agent and character chat, with `ignoreIncompleteToolCalls` in the agent), which closes the
token-cost bypass, the forced-tool path and the stopped-run failure; claimed sessions marked
and capped at 20 per account; one send at a time in the Studio; refusals only undo the send
that gave a session its address; the claim-pending flag cleared on every sign-in and when
there is nothing to claim; plans after a search; the code-block colour; no ring on sections
focused by the nav; the hero clock rebased on any pause; one sound across audio and video.
Left out: per-piece pricing for Auto runs (the owner's call from TICKET-042; the model can
still choose up to six pieces in one run). No follow-up tickets.
