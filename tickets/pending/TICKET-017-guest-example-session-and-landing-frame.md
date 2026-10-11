# TICKET-017: The guest's example session, and the landing frame on the real run

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
A guest's first view of the Studio is a finished example run at its best, and the landing
page's Studio frame renders the same run with the real run component instead of a fixed
replay.

## Context
- Left out of TICKET-006. Design §5.1 (the guest's first session), §11.4 (the frame).
- The example: one real Auto run of a multi-step brief (poster, clip, track, taglines) made
  once on the guest account and marked `pinned` (guests cannot delete it; `lib/sessions.ts`
  lists pinned first). A script `scripts/seed-example.ts` writes it from a recorded
  transcript so it can be restored.
- The landing frame (`app/(landing)/_landing/studio-demo.tsx`) replays that transcript
  through `components/studio/run.tsx` on a timer; `components/studio/run-demo.tsx` goes.
- Also the landing's Edit panel (design §11.6, from TICKET-009) and Characters strip
  (§11.7, from TICKET-010): a real before and after made with Edit, three portraits.
- Cost: one run with a 6 s clip, about $0.30.

## Plan
- [ ] Make the run, record the transcript to `lib/example-run.json`, seed it pinned.
- [ ] The guest's `/studio` opens on it with the composer beneath.
- [ ] The landing frame replays it with the real component; delete `run-demo.tsx`.
- [ ] The landing's Edit panel with a real before and after, and the Characters strip.
- [ ] Verify: `npm run verify`; screenshots at 1440 and 390.

## Progress log
- 2026-10-11 — Opened from TICKET-006's outcome.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `components/studio/run.tsx`, `lib/sessions.ts`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
