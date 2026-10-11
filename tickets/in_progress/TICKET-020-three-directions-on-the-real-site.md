# TICKET-020: Three distinctive directions, built on the real site

**Status:** blocked
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** —
**Area:** ui

## Goal
Three clearly different visual directions, each built as a real page on the `revamp` branch
with the real generated media and motion, so the owner picks one from the running site
instead of from a mockup.

## Context
- The owner on D-003's build (2026-10-11): "not bad but it's too generic, literally every
  image/video generation platform is like that, not much creativity here". The dark stage
  with a full-bleed clip and a centred composer is the category's default (Runway, Krea,
  Pika, Sora).
- What only Aivia does: one brief becomes several media at once (picture, clip, track,
  sound, words). Each direction is built from that.
- Directions: Multitrack (the brief as an edit timeline, a lane and a colour per medium,
  timecode, a playhead); Print shop (a riso two-ink print on paper, grain, misregistration,
  outputs as numbered prints); Rebus (the sentence is the interface; each noun becomes the
  thing it made, inline).
- Pages at `/lab/multitrack`, `/lab/print`, `/lab/rebus`, outside the app shell and out of
  robots. Media from `public/landing/`. Once one is chosen, a decision supersedes D-003 and
  the landing and app tokens follow; the other two pages are deleted.

## Plan
- [x] Media prep: film-strip frames from the clips (`public/lab/*.jpg`), waveform peaks for
      the two tracks (`public/lab/*-peaks.json`).
- [x] The three pages, hero and one more section each, with their motion.
- [ ] Screenshots at 1440 and 390 taken and reviewed; the owner picks.

## Progress log
- 2026-10-11 — Opened from the owner's feedback on D-003.
- 2026-10-11 — Built `/lab/unfold`: one sticky stage over 380svh. The brief types itself in Bricolage; each noun's window opens inline; on scroll the four windows fly to measured slots in a composition (poster, teaser, soundtrack, words), then into lanes on a 30-second timeline with a playhead that lights the score and taglines. Medium colours mark each noun, label and lane. The current landing's sections follow unchanged. Reduced motion shows the composition with no pinning. Checked at 1440 and 390 at five scroll points.
- 2026-10-11 — Owner: likes all three as better than the site, "feel like it can be a lot a lot more better"; liked the current landing (D-003) but "a bit too generic, just need something that wow's"; "def not the print one". Next study: `/lab/unfold`, D-003's base with one signature sequence: the brief types, its nouns open inline (Rebus), fly out into a full composition, and rearrange into the timeline on scroll (Multitrack).
- 2026-10-11 — Built `/lab/multitrack`, `/lab/print`, `/lab/rebus` (fonts DM Mono, Archivo
  at 62% width, Bricolage Grotesque, loaded only in `app/(lab)/layout.tsx`). Reviewed at 1440
  and 390: no overflow, no page errors. Tuned the print's misregistration (0.035em read as
  muddy at 230 px; now 0.014em) and moved the pink ink into the midtones so both inks show;
  fixed the rebus words window squeezing its text.

## Handoff
- **State:** `/lab/unfold` built and reviewed; waiting on the owner.
- **Blocked on:** the owner's verdict on `/lab/unfold`.
- **Next:** record the choice as a decision superseding D-003; restyle the landing and the
  app tokens to it; delete the other two studies and `public/lab` files they alone use.
- **Read first:** the three pages under `app/(lab)/lab/`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
