# TICKET-019: Video generation is failing

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
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
The owner chose Wan 2.2 5b (2026-10-11), after a price check on fal: LTX-2 fast $0.04/s at
1080p ($0.24 to $0.40 a clip); Wan 2.2 5b $0.15 per video (720p, up to 5 s); Hailuo-02
standard $0.045/s; Wan 2.2 a14b $0.08/s at 720p; LTX-Video 13b distilled $0.02/s.
Files read: `lib/ai/capabilities.ts`, `lib/ai/direct.ts` (+ test), `lib/ai/tools.ts`,
`app/api/generate/route.ts`, `components/studio/params.tsx`, `components/studio/outputs.tsx`,
`app/(app)/studio/studio-client.tsx`, `components/studio/run-demo.tsx`,
`lib/guest-examples.json`, `docs/design/revamp.md` §5.2.
- [x] `VIDEO_MODEL` = `fal-ai/wan/v2.2-5b/text-to-video`, 121 frames at 24 fps (5 s), 720p,
      an explicit aspect; price recorded in `capabilities.ts`. Frames stay at 121: the page
      prices "per video" for clips up to 5 s, so longer clips are not assumed to be the same.
- [x] Video mode: the length choice (6/8/10) becomes a shape choice (16:9, 9:16, 1:1),
      `videoAspect` in `DirectRequest` (default 16:9); the agent's tool takes an aspect, not
      a length. A still sent in Video mode keeps animating in its own shape.
- [x] The running skeleton takes the clip's shape.
- [x] Copy that promises ten seconds: the Studio example prompt, the landing demo, the guest
      example's brief and notes, the design doc's §5.2.
- [x] Tests: `direct.test.ts` for the new parameter.
- [x] One real clip through the Studio's Video mode on localhost ($0.15).
- [x] `npm run verify`, `npm run test:e2e`. `main` is not touched (CLAUDE.md, Deploys): the
      live site's video stays down until `revamp` is merged.
- Ruled out: an LTX-2 to Wan fallback (LTX-2 still answers 500; it would add cost and code
  for no working path).

## Progress log
- 2026-10-11 — Opened from the first full multi-step run, recorded for TICKET-017.
- 2026-10-11 — Rechecked LTX-2 with one call: HTTP 500 "Downstream service error" after 18 s.
  The owner picked Wan 2.2 5b.
- 2026-10-11 — Switched. The example clips in `public/landing/` are 5.05 s, so the copy's
  "ten-second teaser" was already untrue; it now says "a short teaser" and "five seconds".
  Animate runs now carry their shape too, so a portrait still's placeholder is portrait (left
  over from TICKET-043). The design doc's steps line follows TICKET-045's "4 steps, 2 done".

## Handoff
- **State:** done.
- **Blocked on:** nothing
- **Next:** the live site still uses LTX-2 until `revamp` is merged (owner's call).
- **Read first:** —

## Verification
```
curl fal.run/fal-ai/ltx-2/text-to-video/fast   # HTTP 500 "Downstream service error", 18 s
npm run verify      # lint, typecheck, tickets, 64 unit tests: passed
npm run test:e2e    # 24 passed (1.4m)
```
One real clip on localhost as the guest, through the Studio's Video mode: the toolbar shows
"Video | 16:9", the request carried `videoAspect: "16:9"`, and the result was a 1280x704,
5.05 s clip from fal after 32 s, playing in the run with no error. Not deployed: `main` is
untouched.

## Outcome
Video runs on `fal-ai/wan/v2.2-5b/text-to-video` at $0.15 a clip (was $0.24 to $0.40 on
LTX-2, which is down): five seconds at 720p in 16:9, 9:16 or 1:1. Video mode chooses the
shape instead of the length; the agent's tool takes an aspect and says clips are five
seconds. Copy and the design doc no longer promise ten seconds. Left out: a fallback to
LTX-2 (still down) and longer clips (the flat price is stated for up to five seconds). The
live site keeps the failing model until `revamp` is merged; no follow-up ticket.
