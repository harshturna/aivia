# TICKET-021: The landing on the Wonder direction, fast, with the sections rewritten

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Make the forest Wonder sequence (D-004) the real landing at `/`, buttery smooth and light
without losing quality, with the changelog and library sections removed and every remaining
section retitled and re-shot in the same world.

## Context
- D-004 (supersedes D-003). The study is `app/(lab)/lab/wonder/page.tsx` with media in
  `public/lab/wonder/`; it came out of TICKET-020.
- The owner (2026-10-11): "I like this, let's make sure everything is buttery smooth, so light
  weight and really optimized animations and such (of course we don't want to compromise the
  quality), also don't need the what changed section. And some of the sections shouldn't be
  there like everything you build kept (this is a basic ass feature) and others can be done
  better with better titles etc".
- Files: `app/(landing)/page.tsx`, `app/(landing)/_landing/{hero,nav,wall,studio-demo,sections}.tsx`,
  `app/layout.tsx` (fonts, theme colour), `app/globals.css` (tokens: CLAUDE.md says tokens
  live there only, no raw hex in components), `lib/landing-media.ts`, `lib/changelog.ts`
  (used only by the Changelog section), `components/studio/{run-demo,ambient-video,audio-row}.tsx`,
  `app/opengraph-image.tsx` + `public/landing/og-poster.jpg`, `app/robots.ts`, `app/sitemap.ts`,
  `scripts/landing-assets.mjs`, `tests/e2e/screens.spec.ts` (the `/` check scrolls the page and
  runs axe), `docs/design/revamp.md` §2 and §11.
- Perf problems found in the study: per-frame CSS variables set on the stage (inherited, so
  every descendant restyles each frame) and a 60 fps clock running even when idle; the brief
  typed by React state, re-rendering the whole stage per character; 120 flex bars reflowing
  as the soundtrack window resizes; fog drifting by `background-position` (repaints every
  frame); motes with blur filters and shadows; light shafts on `mix-blend-mode: screen`; the
  arrival animating `filter`; `backdrop-filter` under moving pieces; `AmbientVideo` plays on
  mount even off screen; `AudioRow` fetches and decodes each track on mount.
- Ruled out: dropping the sequence's scroll-linked motion or the plates' resolution (quality
  stays); a canvas/WebGL rewrite (the DOM version can hit frame budget with the fixes above).
- Related: TICKET-022 (the app on D-004), TICKET-017 (landing Edit panel and Characters strip,
  blocked on TICKET-019's video model).

## Plan
- [ ] Tokens: the forest palette and the new tokens (sun, four medium tints, display font) in
      `app/globals.css`, applied to the landing by a theme attribute; no raw hex in components.
- [ ] Fonts: Cormorant in a landing layout, only the weights used.
- [ ] Hero: move the sequence into `_landing/hero.tsx` on `/`, media into `public/landing/`;
      delete `app/(lab)`, `public/lab`, and `/lab` from robots.
- [ ] Perf: imperative typing; per-frame values written only on the elements that use them;
      clock only while audio plays or the timeline is visible; the waveform as one scaled SVG;
      `contain` on the pieces; fog by transform; motes as gradient dots; no blend modes,
      filters or backdrop blur in motion; scroll work coalesced to one rAF and skipped off
      screen; ambient animation paused off screen and in hidden tabs; hero plate through
      `next/image` with an art-directed portrait crop and priority; teaser clip re-encoded
      and loaded when its window opens; `AmbientVideo` plays only in view; `AudioRow` decodes
      only in view; `content-visibility` on lower sections.
- [ ] Sections: remove Changelog (and `lib/changelog.ts`, the nav and footer links) and the
      library panel. Retitle and rewrite the wall, the Studio demo, modes, pricing and the
      close; the run demo's prompt and steps follow the hero's brief.
- [ ] Media: regenerate the wall's stills and one clip, and a sound, in the same world;
      `lib/landing-media.ts` and `scripts/landing-assets.mjs` updated with the prompts; the
      Open Graph poster from the forest plate.
- [ ] Docs: `docs/design/revamp.md` §2 (tokens, type, motion) and §11 rewritten to D-004.
- [ ] Evidence: frame timing during a scripted scroll before and after (Playwright, rAF
      deltas), page weight before and after, screenshots at 1440 and 390, `npm run verify`,
      `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's choice of the forest study.

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
