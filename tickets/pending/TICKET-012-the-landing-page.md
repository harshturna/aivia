# TICKET-012: - [ ] The asset script and the files; `lib/changelog.ts`.
- [ ] The page section by section per §11; metadata, Open Graph image, `robots` and `sitemap`.
- [ ] Delete the old components, `config/contents.ts`, the old images.
- [ ] Verify: `npm run verify`; `npm run shots` at 1440 and 390 (and 1024); Lighthouse
      performance and accessibility locally; `web-design-guidelines` over `_landing`; a read
      of every sentence against rule 9.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
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
