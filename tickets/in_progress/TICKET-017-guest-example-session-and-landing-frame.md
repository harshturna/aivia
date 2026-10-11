# TICKET-017: The guest's example session, and the landing frame on the real run

**Status:** in-progress
**Created:** 2026-10-11
**Started:** 2026-10-11
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
- 2026-10-11 — Started; the recording run showed four UI faults (TICKET-018) and a video outage (TICKET-019). Blocked on 019.
- 2026-10-11 — The guest example part was delivered by TICKET-038 (curated pinned sessions); the rest no longer waits on video.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** the guest's examples are done by TICKET-038 (four pinned sessions from the
  landing's media, `lib/guest-examples.json`); the earlier recorded night-market run
  (9245d3b9-...) is a hidden guest row now and will be cleaned up. What is left here: the
  landing's Studio frame rendered by the real run component instead of the fixed replay
  (`components/studio/run-demo.tsx`), and the landing's Edit panel and Characters strip.
- **Blocked on:** nothing for the Edit panel and Characters strip; the real-run frame can use
  the forest example from TICKET-038, so it no longer waits on TICKET-019.
- **Next:** decide with the owner whether the landing should gain Edit and Characters
  sections at all, then the frame on the real run component.
- **Read first:** `components/studio/run.tsx`, `lib/guest-examples.json`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
