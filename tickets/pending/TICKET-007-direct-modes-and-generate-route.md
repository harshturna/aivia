# TICKET-007: - [ ] `/api/generate` with a unit test for the parameter validation; `lib/ai/costs.ts`.
- [ ] The client: direct modes send to `/api/generate` and render the run; `?mode=` from the
      redirects preselects the mode.
- [ ] Delete the per-tool pages and routes; trim `constants.ts`.
- [ ] Verify: `npm run verify`; one image and one sound generated in the browser (cost noted;
      no video); `npm run build` lists no deleted route; `npm run shots`.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** feature

## Goal
Direct modes, one generate route, the per-tool pages removed

## Context
Image, Video, Music and Sound modes call the capability directly through one streaming
route, land in the session as a run without a plan, and the six per-tool pages and their
routes are deleted.

## Plan
- Design §5.4, §3 (redirects already in place from 004), D-002.
- Files: new `app/api/generate/route.ts` (guard once, call the capability, write the Asset,
  save the run into the Session, stream a tool-style part so the client renders the same
  deliverable components); `app/(generative-ai)/(routes)/{image,video,music,code,conversation,
  documents,generative}/*` and `app/api/{image,video,music,code,conversation,documents}/route.ts`
  deleted; `constants.ts` (`tools`, `offerings`, the resolution options) trimmed.
- Parameters per mode as in design §5.2; `lib/ai/capabilities.ts` already takes width and
  height, duration and amount; the aspect presets map to edge sizes that stay under one
  megapixel per the note in that file.
- The cost label on the send button reads from one table in `lib/ai/costs.ts` (generations
  per call) that the guard also uses to consume the right count for four images.
- Ruled out: keeping `/api/image` and friends for the old clients (there are none).

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
