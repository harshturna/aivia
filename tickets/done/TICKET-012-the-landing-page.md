# TICKET-012: - [x] The asset script and the files; `lib/changelog.ts`; `lib/landing-media.ts` (every file
      with the prompt that made it).
- [x] The page section by section per §11: nav, hero (three clips crossfading, the real
      composer, example chips, caption, pause), the wall (three rows, one aspect each, clips on
      hover, prompts on hover, two audio rows with real waveforms), the Studio running (the
      product's frame, a presentational sidebar, the replayed run, the composer), the modes
      (four plates), the library frame, pricing, changelog, the close over the sea clip, the
      footer; page metadata.
- [x] Delete `components/landing/*`, `config/contents.ts`, `public/landing.png`,
      `public/features.png`.
- [x] Verify: `npm run verify`; `npm run build`; screenshots at 1440 and 390 of the full page
      and of the hero, wall, Studio frame and modes at the viewport; every sentence read
      against rule 9.
- Left for follow-ups (see Outcome): the Open Graph image, `robots` and `sitemap`, the Edit
  panel, the Characters strip, Lighthouse, the `web-design-guidelines` run.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** 2026-10-10
**Area:** ui

## Goal
The landing page

## Context
The landing page as designed (§11): the serif headline beside a replayed production built
from the app's own run component and real generated assets, the modes with real plates, the
three-step explanation, the staged library and edit panels, the stage band with a looping
clip, characters, pricing, the changelog, the close and the footer, with metadata and an Open
Graph image; the old landing components and images deleted.

## Plan
- Design §11, §2.3 (the one orchestrated moment), D-003, CLAUDE.md rule 9 (features what is
  real; sells, never disclaims; no vendor names).
- Files: `app/(landing)/page.tsx`, `components/landing/{hero,features,pricing,footer,navbar}.tsx`
  (replaced), `config/contents.ts` (deleted), `lib/links.ts`; new `app/(landing)/_landing/
  {nav,hero,replay,plates,steps,panels,band,characters,pricing,changelog,close,footer}.tsx`,
  `lib/changelog.ts` (dated entries; every feature ticket adds one), `app/opengraph-image.tsx`,
  `public/landing/*`.
- Order: this ticket runs right after TICKET-003, before the shell, because the owner judges
  the direction on the real landing page first (D-003). The hero composer is the real
  component, shared with the Studio once TICKET-006 lands; until then it hands the prompt to
  `/get-started?prompt=`.
- Assets: `scripts/landing-assets.mjs` generated three 6 s clips (alley, ink, sea), six stills
  and two audio files on 2026-10-10 (about $1); re-encoded with ffmpeg into `public/landing/`
  (webp, h264 mp4 under 2 MB with posters). Four earlier stills are there already.
- The replay is a client component that steps the run's state on a timer, once, with a
  replay control; reduced motion shows the finished state.
- Performance: fonts preloaded, the hero poster `priority`, clips `preload="none"` with
  posters, Lighthouse checked locally.
- Ruled out: logos, testimonials, ratings (nothing true to put there); a dark hero; an
  auto-scrolling gallery.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-10 — Built: `components/studio/composer.tsx` (the real composer, shared with the
  Studio: glass, growing textarea, the mode menu, send and stop, Enter and Shift+Enter; on the
  landing it hands the prompt to `/get-started?prompt=&mode=`, which signs the guest in and
  opens `/studio` with the field filled), `components/studio/audio-row.tsx` (one global
  player, a waveform decoded from the file), `components/studio/run-demo.tsx` (the replayed
  run on a timeline, started when in view, replayable), `app/(landing)/_landing/*`.
- 2026-10-10 — First screenshots: the hero, the wall and the frames held at 1440 and 390.
  Fixed from them: the replay never started (an effect keyed on state cleared its own timers
  the moment it set them), the Image plate cropped a portrait still (now the 16:9 cafe racer),
  the headline broke to three lines on a phone (minimum 40 px), Sign in was too faint over the
  clip. Biome's `noAutofocus` moved the composer's focus into an effect.
- 2026-10-10 — Started right after TICKET-003, per D-003. LTX-2 (the app's video model) returned downstream errors all evening, so the clips came from wan 2.2 5b at 720p (`scripts/landing-assets.mjs` keeps LTX-2 as the first choice with retries); re-encoded to h264 without audio at about 750 KB each, with poster frames.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** the owner's look at the landing on the `revamp` branch, then TICKET-004 (the shell)
- **Read first:** `app/(landing)/page.tsx`, `components/studio/composer.tsx`

## Verification
```
npm run verify   # biome 0 errors (58 warnings in files later tickets replace), tsc clean,
                 # 15 tickets, 3 unit tests
npm run build    # Next 16.4: compiled; / prerendered static; proxy detected; exit 0
npm run shots    # / at 1440 and 390, full page; plus the hero, the wall, the Studio frame
                 # after its replay and the modes at the 1440 viewport, all reviewed
curl /           # 200 on the dev server
```
Copy read against CLAUDE.md rule 9: no vendor or model names, no disclaimers, no "coming
soon", no eyebrows, no accented word, sentence case throughout.

## Outcome
Shipped: the landing page on D-003 with the app's own generated media (three clips, ten
stills, two tracks, all captioned with the line that made them), the real composer as the
hero handing a prompt into the Studio, the Studio shown running as a replay, the wall, the
modes, the library frame, pricing, changelog, close and footer; the old landing components,
`config/contents.ts` and two old images removed; `scripts/landing-assets.mjs` for the media.

Left out, each a follow-up: the Open Graph image, `robots` and `sitemap` (TICKET-016); the Edit
panel and the Characters strip, which show those screens once TICKET-009 and TICKET-010
exist, and the Studio frame's body swapped for the real run component after TICKET-006
(noted in those tickets); a Lighthouse pass and the `web-design-guidelines` run over
`_landing` (TICKET-014's accessibility and performance pass).
