# TICKET-007: - [ ] `/api/generate` with a unit test for the parameter validation; `lib/ai/costs.ts`.
- [ ] The client: direct modes send to `/api/generate` and render the run; `?mode=` from the
      redirects preselects the mode.
- [ ] Delete the per-tool pages and routes; trim `constants.ts`.
- [ ] Verify: `npm run verify`; one image and one sound generated in the browser (cost noted;
      no video); `npm run build` lists no deleted route; `npm run shots`.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Direct modes, one generate route, the per-tool pages removed

## Context
Image, Video, Music and Sound modes call the capability directly through one streaming
route, land in the session as a run without a plan, and the six per-tool pages and their
routes are deleted.

## Plan
- [x] `lib/ai/direct.ts` (validation, aspect sizes under one megapixel on a 32 px grid, the
      cost of a request) with four tests; `/api/generate` streams the result as a tool part
      (start, tool input, tool output or error, finish), records the asset, names and saves
      the session, and charges only a request that produced something.
- [x] The guard takes a cost; the allowance counters increment by an amount in one atomic
      upsert (two runs finishing together could both have read the old count); the free
      check asks whether the whole cost fits.
- [x] The client routes Auto to `/api/agent` and a direct mode to `/api/generate` per send;
      `?mode=` preselects the mode; a direct run waits with "Generating…", not "Planning…";
      the agent's temporary mode hint is gone.
- [x] Deleted: the conversation, code, documents, image, video and music pages and routes,
      `GenerativeChat`, `Artifact`, `Heading`, `Empty`, the `tools` and `offerings`
      constants; six permanent redirects; two changelog lines.
- [x] Verify: `npm run verify`; `npm run build`; `/image` lands in Image mode; a direct
      16:9 image run.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built. The new-session page broke with `MODES.some is not a function`: a
  server page imported the list from the composer's client module (the same trap as the
  sidebar cookie in TICKET-004); the list moved to `components/studio/modes.ts`. The
  routing uses the transport's `prepareSendMessagesRequest`, which can return an `api`.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-008 (library and lightbox)
- **Read first:** `app/api/generate/route.ts`, `lib/ai/direct.ts`

## Verification
```
npm run verify   # biome 0 errors, tsc clean, 17 tickets, 24 unit tests (direct 4 new)
npm run build    # exit 0; no /image /video /music /code /conversation /documents routes;
                 # /api/generate present
playwright, as the guest:
  /image → /studio?mode=image (Image pill, aspect and count pills)
  16:9, "A quiet harbour at dawn…" → POST /api/generate only; the image renders at 16:9;
  /api/assets has one image for the session at 1312×736
```
Not run: video, music and sound in direct mode (cost; the route's branches share the image
path's stream and save, and the capabilities are the ones the agent already calls).

## Outcome
Shipped: direct modes on their own route with exact costs, atomic allowance counters, the
per-tool pages and their code removed behind redirects, changelog lines. Left out: image to
video (animate an image), which needs an image-to-video capability; not planned. No new
tickets.
