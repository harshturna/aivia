# TICKET-040: Cut a run into one finished piece

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
The landing promises "cut together on one timeline"; the Studio should do it: a run's clip, score, poster and taglines assembled into one playable piece and exported as a single video.

## Context
- One of the three additions the owner accepted on 2026-10-11 ("let's add stuff"), after
  TICKET-039 (Animate). The landing's hero ends on "Cut together on one timeline"; today a
  run's outputs stay separate pieces.
- Tried first: `fal-ai/ffmpeg-api/compose` (real calls, a few cents). An image track is
  rejected ("Multiple video tracks are not supported"); an image keyframe inside the video
  track is silently dropped (the video stream was 10.09 s of the requested 13); the audio
  keyframe's duration is ignored (30 s of score under 10 s of picture). It cannot make an end
  card or fit the score, so it is ruled out.
- Chosen: compose in the browser with WebCodecs through `mediabunny` 1.59.1 (MPL-2.0, released
  2026-09-23, pinned exact; types read: `Input`/`UrlSource`/`ALL_FORMATS`, `CanvasSink` with
  `getCanvas(t)`, `Output`/`Mp4OutputFormat`/`WebMOutputFormat`/`BufferTarget`,
  `CanvasSource.add(t, d)`, `AudioBufferSource.add(buffer)`, `canEncodeVideo`/`canEncodeAudio`).
  It costs nothing per cut, lets the title cards use the display face, and fits the score.
  fal's media allows cross-origin reads (`access-control-allow-origin: *`, checked).
  Loaded only when someone renders (dynamic import), so no page carries it.
- Where: `components/studio/run.tsx` (read) renders a finished run's outputs and notes; the
  cut control goes after them. Outputs are tool parts (`components/studio/outputs.tsx`,
  read): images `{ urls }`, video, music and sound `{ url }`; taglines are numbered lines in
  the run's notes. The Studio-actions context (`components/studio/actions.tsx`, TICKET-039)
  says whether the Studio offers it and whether the result can be saved (not for the guest,
  TICKET-038). Saving goes through a new `POST /api/cuts` that uploads the file to fal
  storage (`lib/ai/fal.ts`) and records a video asset (`lib/assets.ts`).
- Landing (rule 9): the Studio demo's lede (`app/(landing)/_landing/studio-demo.tsx`, read)
  says the run is cut into one piece; the hero's timeline line becomes true.

## Plan
- [x] `lib/cut.ts` (pure, tested): collect a run's pieces (clips, stills, a track, lines) and
      plan the cut: a title card with the first line, the clips back to back with short
      crossfades, an end card on the poster with the next line and a slow push-in, a fade to
      black; stills alone become a slow-zoom slideshow; the score trimmed to the cut with fades.
- [x] `components/studio/cut.tsx`: "Cut it together" on a finished run with a clip, or with a
      still and a track; a dialog shows the plan as lanes, renders with progress (MP4 where
      the browser encodes H.264/AAC, WebM otherwise, a clear message if neither), previews
      the result, downloads it, and saves it to the library for a signed-in user.
- [x] `POST /api/cuts`: signed-in users only, not the guest; a video file up to 80 MB;
      uploaded to fal storage; recorded as a video asset on the session.
- [x] The Studio provides the action; the landing's Studio lede; design doc §5.3.
- [x] Check: render the forest example's cut in a browser (duration, the end card, the score),
      the save route for a non-guest is exercised by a unit-level check of its guards;
      screens; `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened as a follow-up of the feature proposal.
- 2026-10-11 — fal compose tried and ruled out (see Context). Built: `lib/cut.ts` (`linesIn`, `collectCut`, `canCut`, `planCut`, `alphaAt`, `CUT`; 6 tests on the forest example and edge cases); `components/studio/cut-render.ts` (mediabunny loaded on render; clips read with `CanvasSink.getCanvas` at each output time, stills drawn cover with a slow zoom, the display face for cards, the score fitted in an `OfflineAudioContext`, MP4 or WebM chosen by `canEncodeVideo`/`canEncodeAudio`, 24 fps, long edge at most 1280); `components/studio/cut.tsx` (the action, the lanes, progress, preview, download, save); `POST /api/cuts` (401 signed out, 403 guest, video only, 80 MB, fal storage, a video asset on the user's own session). The Studio offers it through the actions context; a finished run shows it when `canCut`. Title and end-card text enlarged after the first render. Landing Studio lede and design doc §5.3 updated.
- 2026-10-11 — The landing's axe check raced the demo's step fades again (phone, once); it now runs with reduced motion so every fade and replay renders final.

## Verification
As the guest, on the forest example, "Cut it together" then "Cut it", in Playwright's Chromium
and in installed Chrome: rendered in 14 to 19 s, no page errors; the file (ffprobe): H.264
960x528 at 24 fps, 9.04 s, AAC 9.13 s, mean volume -15.4 dB; frames: the title card in the
display face, the waterfall, the end card on the tree with the second line, the fade. The
save route: 401 signed out, 403 for the guest. A successful save was not exercised (no
non-guest account here); its path is the same upload and `recordAsset` the generators use.

```
npm run verify    # lint, typecheck, check:tickets, 43 unit tests (6 new): passed
npm run test:e2e  # 24 passed (after moving the landing's axe check to reduced motion)
```

## Outcome
Shipped on `revamp`: any finished run with a clip, or stills and a track, cuts into one film in
the browser at no cost, downloads, and is kept in the library for signed-in users. Left out:
choosing or reordering pieces by hand (the automatic cut first); a cut in the Auto agent's
own plan. Next: TICKET-041.
