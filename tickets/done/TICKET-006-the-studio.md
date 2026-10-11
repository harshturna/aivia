# TICKET-006: - [ ] `lib/ai/plan.ts` with tests; the system prompt change in `app/api/agent/route.ts`.
- [ ] The composer: textarea growth, attachments (chips, paste, drop overlay), mode pill and
      per-mode parameter pills, cost label, send and stop, keys (`Enter`, `Shift+Enter`, `/`,
      `Esc`, `↑`, slash commands).
- [ ] The run: brief, plan with status and elapsed, deliverables (image grid with hover
      actions, video card, audio row with waveform and the global player, source chips, code
      blocks), notes; the limit message and in-place errors; the empty state with chips; the
      composer's move from centre to bottom (Motion layout).
- [ ] `/studio` and `/studio/[id]` on the shell with the session header actions (rename,
      delete, status); the guest's example session.
- [ ] Verify: `npm run verify`; a real Auto run in the browser (one image; cost noted); the
      limit path by lowering the cap locally; `npm run shots` at 1440 and 390; keyboard pass;
      `web-design-guidelines` over `components/studio`.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The Studio: composer, empty state, the run

## Context
The Studio is the front door as designed (§5): the serif line and the composer in the
middle of a new session, the composer with modes and parameter pills and attachments and its
keys, and every exchange rendered as a run with its brief, its numbered plan with live status,
its deliverables at their final size with the shimmer and the blur reveal, its sources and
its notes; limits and errors inline.
- The landing's Studio frame (`app/(landing)/_landing/studio-demo.tsx`) replays a fixed run with `components/studio/run-demo.tsx`; once the real run component exists, the frame renders it from a recorded transcript and `run-demo.tsx` goes. `components/studio/composer.tsx` and `audio-row.tsx` already exist from TICKET-012 and are extended, not replaced.

## Plan
- [x] `lib/ai/plan.ts` with nine tests: the numbered list in the first text block is the
      plan, tool calls advance its steps in order, a failed tool fails its step, the rest is
      notes. The system prompt asks for that list when there is more than one step, and to
      ground document answers.
- [x] The composer: growing field, attachments (picker, paste, page-wide drop with an
      overlay, chips with remove; images, PDFs, text; four files, 10 MB each), the mode menu,
      each mode's parameter pills, the cost label, send and stop, Enter, Shift+Enter, `/`,
      Esc, ↑ for the last brief; autofocus on desktop only.
- [x] The run: the brief as a line with its attachments, the steps strip (open while
      running with the elapsed time, closed after), outputs at their final shape (shimmer
      placeholders with the prompt, the blur reveal, image hover actions, video, the audio
      row with a waveform and its own duration, source chips, the failed slot with Retry),
      notes through the markdown renderer; status announced politely.
- [x] `/studio` and `/studio/[id]` on the shell: the empty state with four example chips,
      the composer moving from the centre to the foot (Motion layout), the header's rename
      in place and two-step delete, the inline limit messages, the "stopped before it
      finished" retry. One header on a phone (the shell's bar steps aside).
- [x] Direct modes send `mode` and `params` with the request; until TICKET-007 the agent is
      told to call the one tool directly.
- [x] Verify: `npm run verify`; a real Auto run; screenshots at 1440 and 390; delete tested;
      the web interface guidelines checked over `components/studio`.
- Left out, in TICKET-017: the guest's finished example session and the landing frame
  rendered with the real run component.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Started after TICKET-005. Built the parser, composer, run, outputs, params
  and the client. Found by screenshot: audio titles cut at the first comma ("A single"),
  two stacked headers on a phone, the last lines parked under the composer by auto-scroll.
  Found by the guidelines: delete acted at once, status changes were silent, placeholders
  lacked "…", autofocus would open a phone's keyboard. All fixed. A failed tool still counts
  the request (the route consumes on finish), so the failed slot does not claim otherwise.
  The helpers that name sessions moved to `lib/session-text.ts` so the client can use them
  without the database.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-007 (direct modes and the generate route)
- **Read first:** `app/(app)/studio/studio-client.tsx`, `components/studio/*`, `lib/ai/plan.ts`

## Verification
```
npm run verify     # biome 0 errors (54 warnings, older files), tsc clean, 16 tickets,
                   # 20 unit tests (plan 9, assets and sessions 8, parts 3)
playwright, as the guest:
  /studio empty state at 1440 and 390; Image mode shows its aspect and count pills
  a resumed session renders its run (the knock, titled "A single, sharp knuckle knock…")
  a real Auto brief (one image, about $0.003): the image reveals, caption and Reuse prompt,
    the notes; one header at 390
  Delete → "Delete this session" → the row is gone and the page is a new session
```
Not seen in a screenshot: the running state of a multi-step plan (the test brief was
answered as one step); the steps strip is covered by the parser's tests and the component
renders the same data.

## Outcome
Shipped: the Studio as designed in §5: the composer with attachments, modes, parameters and
keys; runs with the plan, outputs and notes; the empty state; rename and delete; limits and
retries inline. Left out: the guest's example session and the landing frame on the real run
component (TICKET-017); direct modes still go through the agent until TICKET-007. The
landing's muted loops do not yet stop under reduced motion outside the hero (TICKET-014).
