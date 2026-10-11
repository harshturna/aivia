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

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
The Studio: composer, empty state, the run

## Context
The Studio is the front door as designed (§5): the serif line and the composer in the
middle of a new session, the composer with modes and parameter pills and attachments and its
keys, and every exchange rendered as a run with its brief, its numbered plan with live status,
its deliverables at their final size with the shimmer and the blur reveal, its sources and
its notes; limits and errors inline.

## Plan
- Design §5 (all of it), §2.3 (motion), §13 (states), D-001, D-002, TICKET-005's routes.
- Files: `app/(generative-ai)/(routes)/studio/page.tsx` (replaced by `app/(app)/studio/page.tsx`
  and `app/(app)/studio/[id]/page.tsx`), `components/ai/Artifact.tsx`, `GenerativeChat.tsx`,
  `Markdown.tsx`, `Empty.tsx`, `Loader.tsx`, `TypingDots.tsx`, `BotAvatar.tsx`, `UserAvatar.tsx`
  (replaced); new `components/studio/{composer,mode-pill,param-pills,attachments,run,brief,
  plan,deliverables,image-card,video-card,audio-row,source-chips,notes,empty-state,limit-
  message}.tsx`, `components/studio/use-elapsed.ts`, `lib/ai/plan.ts` (turns reasoning text and
  tool parts into plan steps with status; unit-tested).
- The plan: the agent is asked (system prompt) to open with its steps as a numbered list;
  `lib/ai/plan.ts` parses that list from the first text or reasoning part and matches tool
  calls to steps by order, falling back to one line per tool call. Status comes from the tool
  part's state and timestamps kept in the client.
- Audio: one `<audio>` element in a provider; the waveform from `decodeAudioData` on load,
  cached per URL; the docked mini player when the playing row leaves the viewport.
- Images reveal with `onLoad`; the lightbox for expand is TICKET-008's and until then expand
  opens the URL.
- The composer's parameters feed `/api/generate` (TICKET-007); in this ticket the Auto mode
  is complete and the other modes render their pills and are wired in 007.
- Ruled out: chat bubbles and avatars; typing dots; a progress percentage the provider does
  not report.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `docs/design/revamp.md`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
