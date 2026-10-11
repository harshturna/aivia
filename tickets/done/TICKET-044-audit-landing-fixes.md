# TICKET-044: Audit fixes, landing

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** landing

## Goal
Fix the landing findings of the 2026-10-11 audit (TICKET-042), each verified in the code.

## Context
Files read: `app/(landing)/_landing/hero.tsx`, `smooth-scroll.tsx`, `sections.tsx`, `nav.tsx`,
`app/(landing)/page.tsx`, `app/(landing)/layout.tsx`, `app/globals.css`,
`components/studio/composer.tsx`, `app/layout.tsx`.
1. Hero windows open on timers counted from page load (`OPEN_AT` against
   `performance.now()`); when hydration is late every window opens at once, out of step with
   its word.
2. `min-h-[640px]` on the stage and the reduced section: on a landscape phone (390 px tall)
   the sticky stage is taller than the screen and the scroll progress (`r.height -
   innerHeight`) no longer matches the stage.
3. Lenis: a key press mid-glide fights the glide; inner scroll areas are smoothed too; the skip
   link and nav anchors are taken over by the anchor handler, so focus never moves and the
   fixed nav covers the section top.
4. The hero soundtrack keeps playing once scrolled away; two players on a page can play at
   once.
5. Triptych meta labels at `text-fg/55` are under 4.5:1 on the forest.
6. `html { scroll-behavior: smooth }` survives reduced motion (`:root *` does not match html).
7. The teaser keeps decoding behind the filmstrip, and is preloaded under reduced motion
   where it never plays.
8. The sound button's name flips between two labels; with `aria-pressed` it should be static.
9. Modes grid has no `minmax(0,1fr)` column, so at 320 px a long caption widens it.
10. `aria-keyshortcuts="/"` on the composer announces a key that types a slash there.

## Plan
- [x] Windows open from each noun's own animation clock (`getAnimations`), late ones staggered.
- [x] Drop the 640 px minimum; progress from `r.height - stage.offsetHeight`; look at 844x390.
- [x] Lenis: cancel a glide on scroll keys, `prevent` inner scrollers, anchors offset by the nav
      and focus their target; `scroll-mt-20` on sections for the no-Lenis path.
- [x] Hero audio pauses off screen; one audio element plays at a time across the app.
- [x] Meta labels `text-fg/75`.
- [x] `html { scroll-behavior: auto }` under reduced motion.
- [x] Teaser pauses under the filmstrip; no preload under reduced motion.
- [x] Sound button: one name, state in `aria-pressed`.
- [x] Modes `grid-cols-[minmax(0,1fr)]`.
- [x] Remove `aria-keyshortcuts="/"`.
- [x] `npm run verify`, `npm run test:e2e`, `npm run shots` at 1440 and 390.

## Progress log
- 2026-10-11 — Opened from the audit; findings verified.
- 2026-10-11 — Window timing: first tried each noun's `getAnimations()` clock against timers,
  then found (in a background tab, where `document.timeline` stands at 0) that wall-clock
  timers open windows over words that have not risen. Settled on `animationstart` per noun,
  with words that rose before hydration followed 260 ms apart.
- 2026-10-11 — Without the 640 px floor a 390 px tall screen cut off the timeline's last lane
  (it was cut off with the floor too, the stage being taller than the screen). Added a
  `short` variant (`max-height: 520px`) in `globals.css` that tightens the timeline's padding,
  lanes and bottom fade.
- 2026-10-11 — Lenis honours `scroll-margin-top`, so a −80 offset doubled it (pricing landed
  at 160). Anchors now rely on `scroll-mt-20` and settle against the computed margin.

## Handoff
- **State:** done.
- **Blocked on:** nothing
- **Next:** TICKET-045 (design and accessibility).
- **Read first:** —

## Verification
```
npm run verify      # lint, typecheck, tickets, 63 unit tests: passed
npm run test:e2e    # 24 passed
npm run shots       # .shots/landing@1440.png, landing@390.png and the rest
```
Playwright on localhost: windows open at 1230/1397/1524/1778 ms on a normal load; with every
script chunk delayed 2.5 s they still open one after another (3517 to 4059 ms); under reduced
motion all at once. At 844x390 the triptych and the timeline fit (all four lanes, header
clear of the nav). Tab then Enter on the skip link focuses `main`; the Pricing link lands
the section 82 px from the top and focuses it. The soundtrack, playing, pauses when a wheel
scroll takes the hero off screen. Modes at 320 px: no horizontal overflow. Viewport shots of
Modes at 320/390/1440 reviewed; the full-page shots do not paint `content-visibility`
sections, so those were reviewed from viewport shots. Web interface guidelines run over the
touched files: nothing to change.

## Outcome
Shipped every Plan item: windows on their words' own clock, the stage one screen tall with
a short-screen timeline, Lenis that yields to keys and inner scrollers and moves focus with
its anchors, the hero's sound paused off screen and one sound at a time app-wide
(`components/one-sound.tsx`), readable meta labels, plain scrolling under reduced motion, the
teaser paused under the filmstrip and not preloaded when it cannot play, a static sound
button name, a Modes grid that cannot widen, and no `aria-keyshortcuts="/"`.
Left out: nothing from the audit's landing list. No follow-up tickets.
