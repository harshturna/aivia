# TICKET-018: Fixes from the first full run

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The four faults the first real multi-step run showed are gone: the sidebar stays put on long pages, a failed output reads correctly, the steps line admits a failure, and notes keep their paragraphs.

## Context
- Found recording TICKET-017's example (session 9245d3b9…, screenshots `.shots/example-*`).
- `components/shell/shell.tsx`: the root's `h-full` caps the sticky sidebar's container at
  one screen, so it scrolls away.
- `components/studio/outputs.tsx`: "Could not make the the clip" (the label already has "the").
- `components/studio/run.tsx` / `lib/ai/plan.ts`: "4 steps · done" with a check when a tool
  failed; retries shift the index match, so the header must not claim success.
- `lib/ai/plan.ts`: notes chunks separated by tool calls are joined with "" ("one.The").

## Plan
- [x] The four fixes; plan tests for the notes join, the failed state, and a citation not
      breaking a sentence (only a tool call starts a new paragraph).
- [x] Verify: `npm run verify`; the recorded session re-rendered at 1440; scrolled to the end.

## Progress log
- 2026-10-11 — Opened from the first full multi-step run, recorded for TICKET-017.
- 2026-10-11 — Fixed: the shell root lost `h-full`; the failed slot reads "Could not make the clip"; the steps line shows a cross and "not everything worked"; notes join with a paragraph at each tool call.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-016
- **Read first:** `lib/ai/plan.ts`

## Verification
```
npm run verify   # biome 0 errors, tsc clean, tests pass (plan 11)
playwright: session 9245d3b9… at 1440 → "4 steps · not everything worked" with a cross;
  scrolled to the end, the sidebar's top is 0; the notes are separate paragraphs
```

## Outcome
Shipped: the four fixes with tests. No new tickets.
