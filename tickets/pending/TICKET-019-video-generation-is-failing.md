# TICKET-019: Video generation is failing

**Status:** blocked
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ai

## Goal
Video works again, on the live site and in the revamp.

## Context
- `fal-ai/ltx-2/text-to-video/fast` (`VIDEO_MODEL` in `lib/ai/capabilities.ts`) answered
  "Downstream service error" (HTTP 500) on every call on 2026-10-10 evening and again on
  2026-10-11 (three agent attempts in session 9245d3b9…). `main` uses the same model, so
  the live site's video is down too.
- `fal-ai/wan/v2.2-5b/text-to-video` produced the three landing clips on 2026-10-10 at 720p
  in 36 to 115 s (`scripts/landing-assets.mjs` and its retry log).
- The choice is the owner's: a model change changes the price per clip (CLAUDE.md, Costs).
  Options: wait for LTX-2; switch to wan 2.2 5b (720p, price to check on fal); add a fallback
  that tries wan when LTX-2 answers 5xx.

## Plan
- [ ] The owner picks; record the price per clip in `capabilities.ts`.
- [ ] Implement; one real clip; deploy on `main` too if the owner wants the live site fixed now.

## Progress log
- 2026-10-11 — Opened from the first full multi-step run, recorded for TICKET-017.

## Handoff
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** see Context

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
