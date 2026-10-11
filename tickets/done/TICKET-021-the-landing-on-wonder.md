# TICKET-021: The landing on the Wonder direction, fast, with the sections rewritten

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
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
- [x] Tokens: the forest palette and the new tokens (sun, four medium tints, display font) in
      `app/globals.css`, applied to the landing by a theme attribute; no raw hex in components.
- [x] Fonts: Cormorant in a landing layout, only the weights used.
- [x] Hero: move the sequence into `_landing/hero.tsx` on `/`, media into `public/landing/`;
      delete `app/(lab)`, `public/lab`, and `/lab` from robots.
- [x] Perf: imperative typing; per-frame values written only on the elements that use them;
      clock only while audio plays or the timeline is visible; the waveform as one scaled SVG;
      `contain` on the pieces; fog by transform; motes as gradient dots; no blend modes,
      filters or backdrop blur in motion; scroll work coalesced to one rAF and skipped off
      screen; ambient animation paused off screen and in hidden tabs; hero plate through
      `next/image` with an art-directed portrait crop and priority; teaser clip re-encoded
      and loaded when its window opens; `AmbientVideo` plays only in view; `AudioRow` decodes
      only in view; `content-visibility` on lower sections.
- [x] Sections: remove Changelog (and `lib/changelog.ts`, the nav and footer links) and the
      library panel. Retitle and rewrite the wall, the Studio demo, modes, pricing and the
      close; the run demo's prompt and steps follow the hero's brief.
- [x] Media: regenerate the wall's stills and one clip, and a sound, in the same world;
      `lib/landing-media.ts` and `scripts/landing-assets.mjs` updated with the prompts; the
      Open Graph poster from the forest plate.
- [x] Docs: `docs/design/revamp.md` §2 (tokens, type, motion) and §11 rewritten to D-004.
- [x] Evidence: frame timing during a scripted scroll before and after (Playwright, rAF
      deltas), page weight before and after, screenshots at 1440 and 390, `npm run verify`,
      `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's choice of the forest study.
- 2026-10-11 — Baseline on `/lab/wonder` (Playwright, scripted wheel scroll through the hero, CPU throttled 4x, 1440x900, dev server): 60 of 260 frames over 33 ms, p95 50 ms, p99 83 ms; 6.3 MB transferred on load.
- 2026-10-11 — Moved the sequence to `/` (`_landing/hero.tsx`) with tokens in `app/globals.css` (`[data-theme="forest"]`, `--sun`, `--sun-soft`, four `--tint-*`, `--font-display`), Cormorant in `app/(landing)/layout.tsx` (500 roman and italic only). The display token is declared again inside the theme because `--font-cormorant` only exists on the layout element. The primary button and the focus ring now read tokens (`bg-primary`, `--color-ring`), white as before in the app.
- 2026-10-11 — Perf: typing writes classes, not state; the clock runs only while the score plays or the timeline is visible; the waveform is one SVG drawn twice with the played part clipped; fog drifts by transform with its fades baked into the plates; motes are gradient dots; no blend mode, filter or backdrop blur in motion; the plate is art-directed through `getImageProps` with `preload`, AVIF enabled in `next.config`; the teaser clip (re-encoded 1.8 MB to 660 KB) loads when its window opens; `AmbientVideo` loads and plays only in view; `AudioRow` decodes only near the screen; lower sections use `content-visibility`. A metrics pass showed style recalc was still 670 ms of a 4.6 s scroll: the per-window custom properties restyled 240 waveform rects every frame. Writing values onto the parts that use them brought it to 219 ms and the task total from 1323 to 784 ms.
- 2026-10-11 — Sections: changelog and library panel removed (`lib/changelog.ts` deleted, nav and footer links gone). New titles: "Now write yours.", "Every one of these was a sentence first.", "It plans the work, then does it.", "Need just one thing? Ask for just that.", "Start free.", "Begin with one sentence." New media in the same world (nine flux-pro ultra stills, an aurora loop, a dawn-chorus sound; about $0.80); the night-market files are deleted. The run demo tells the forest brief. `app/(lab)` and `public/lab` deleted; `/lab` out of robots.
- 2026-10-11 — Guidelines review (web-design-guidelines) fixes: the teaser no longer autoplays under reduced motion; the hero section no longer repeats the h1's label; a skip link in the nav; the demo composer is `inert`.

## Verification
Frame timing (same script, scroll and 4x throttle as the baseline; headless software raster):

| | before (`/lab/wonder`) | after (`/`) |
|---|---|---|
| frames over 33 ms | 59 to 61 of ~260 | 6 to 17 of ~280 |
| p95 / p99 | 50 / 83 ms | 33 / 33 to 50 ms |
| transferred on load (dev) | 6.3 MB | 2.3 MB |

The same scroll unthrottled shows the same handful of slow frames, so what remains is the
headless software rasteriser; with GPU rasterisation (`--use-angle=metal`) a clean run is 3 of
308 frames over 33 ms at 4x throttle, p95 16.7 ms. Main thread over the scroll at 4x: style
670 to 219 ms, total task 1323 to 784 ms. Screens reviewed at 1440x900 and 390x844 at five
points of the sequence and at every section heading (console errors: none).

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed (includes / scrolled end to end with axe)
```

## Outcome
Shipped on `revamp` (not pushed): the forest sequence is the landing at `/`, with the forest
theme tokens, Cormorant, the perf pass, the changelog and library sections removed, every
remaining section retitled and re-shot in the same world, the share image from the forest,
`scripts/landing-assets.mjs` regenerating the whole set, and `docs/design/revamp.md` §2 and §11
on D-004. Left out: the app in the new direction (TICKET-022); the Edit and Characters strips
on the landing stay with TICKET-017 (blocked on TICKET-019's video model). Worth checking on a
real phone, since headless numbers cannot show GPU raster cost on a device.
