# TICKET-061: The timeline core, with Cut it together on it

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
A versioned timeline document and one compositor for preview and export, in `lib/timeline`, with today's Cut it together rendering through it. No visible change: the ground the editor stands on.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Reads: `lib/cut.ts`, `components/studio/cut-render.ts`, research engineering §1 to §3.
- Files: `lib/cut.ts` (planCut, alphaAt, CUT stay for now: the cut's numbers move into
  `from-cut.ts`), `components/studio/cut-render.ts` (becomes a thin wrapper), new
  `lib/timeline/{schema,migrate,layout,from-cut}.ts` (+ tests), new
  `components/timeline/{compositor,export}.ts`, `package.json` (mediabunny 1.61.x,
  `@mediabunny/aac-encoder`).
- Baseline (today's renderer, `.audit/t061/base.json`): forest 9.13 s 960×528 MP4; owl 7.75 s
  960×528; dawn chorus 3.07 s 1280×1280; whale has no cut. The rebuilt path must match the
  lengths and sizes, and the middle frames by eye.
- Tracks in v1 (§17.5): text, main (picture: clips and stills), and audio tracks with a role,
  score or sound. Overlay tracks are left for v2 but the type allows adding them.
- Includes the mediabunny upgrade to 1.61.x and the optional AAC encoder for older Safari.

## Plan
- [x] `lib/timeline/schema.ts`: TimelineDoc v1 types and zod (integer ms, a media map, tracks
      text, main and audio with a role), `docDuration`, defaults; `migrate.ts` (parse, newer
      versions flagged read-only).
- [x] `lib/timeline/layout.ts`: `visualsAt(doc, ms)` (which items show, alpha, zoom, source
      time) and `gainAt(item, ms)`; the generalisation of `alphaAt` and the segment loop.
- [x] `lib/timeline/from-cut.ts`: today's template as a TimelineDoc (title card, clips with
      crossfades, an end card still with its line and push-in, or a stills slideshow; the score
      with a 0.4 s fade in and 1.6 s fade out).
- [x] Tests: schema round trip and rejection, migrate, from-cut timing equal to `planCut` for
      the same pieces, layout alpha equal to `alphaAt`.
- [x] `components/timeline/compositor.ts` (draw one frame from layout ops) and `export.ts`
      (`renderTimeline(doc, …)`: decode, draw, mix audio with the item gains, encode); the
      AAC encoder loaded only when the browser cannot encode AAC.
- [x] `renderCut` builds the doc with `fromCut` and calls `renderTimeline`; mediabunny 1.61.x.
- [x] Verify: `npm run verify`; `.audit/t061/base.mjs` after: the same lengths and sizes for the
      three examples and matching middle frames; `npm run test:e2e`.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, baseline recorded, plan written.
- 2026-10-11 — Built. Crossfades are data, not a separate track: an item with `transitionIn`
  overlaps the one before, which fades out over it (`mainFades`). Text draws above pictures,
  so during the title's last half second it fades over the first clip rather than under it
  (the old renderer drew the clip on top); the middle frames are unchanged. The frame size is
  part of the document (the first clip's shape, at most 1280), so export draws at the doc's
  size. `lib/cut.ts` keeps `collectCut`, `canCut` and `planCut` (the parity test reads it).

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-062.
- **Read first:** nothing

## Verification
```
npx vitest run lib/timeline   # 11 tests: schema round trip and rejection, migrate (current,
                              # newer read-only, junk), fromCut timing equal to planCut sampled
                              # every 1/24 s for clip+poster, clips without poster and a stills
                              # slideshow; the score envelope; the end card; source in-points
.audit/t061/base.mjs before and after, every guest example through Cut it together:
  forest 9.13 s 960x528 mp4 → 9.13 s 960x528 mp4 (2,553,710 → 2,569,817 bytes)
  owl    7.75 s 960x528 mp4 → 7.75 s 960x528 mp4 (1,685,931 → 1,674,137 bytes)
  dawn   3.07 s 1280x1280   → 3.07 s 1280x1280   (1,001,058 → 1,012,148 bytes)
  middle frames: mean pixel difference 0.11, 0.14, 0.16 of 255 (cmp-*.png reviewed);
  title and end card frames reviewed (after-title-end.png)
npm run verify    # lint, typecheck, tickets, 93 unit tests: pass
npm run test:e2e  # 37 passed, 1 skipped
```

## Outcome
Shipped: `lib/timeline` (TimelineDoc v1 schema, migrate, layout, the cut template as a doc,
tests), `components/timeline/compositor.ts` and `export.ts` (one drawing path for the player
and export, audio mixed from item envelopes, the AAC encoder loaded only where the browser
lacks AAC), `renderCut` rebuilt on them with the same output, mediabunny 1.61.3. No visible
change. Left out: nothing.
