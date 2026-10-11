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
- 2026-10-11 — Owner on `/lab/wonder`: "it shouldn't be castle or clouds like that ... more like nature but with still some awe, wonder"; and the "make something today" section "has like start and end which feels weird, it should blend with the page". Rebuilt `/lab/wonder` as an old forest at first light (flux-pro ultra: forest, valley, lone-tree poster, waterfall canyon, low fog; wan 2.2 5b static-camera loops of the canyon and the valley; about $0.45). Light shafts breathe over the plate, seeded motes rise through them, low fog replaces the cloud bank, tree rings replace the astrolabe, tints are bark, water, light and fern, and the page tokens are moss-dark. The castle assets are deleted. Close (shared, `app/(landing)/_landing/sections.tsx`): the clip now fades with a mask instead of a gradient painted in the old background colour, which is what showed its edges; it takes an optional clip and heading class, and the landing keeps its default clip. Checked at 1440 and 390 at five scroll points, both handoffs, and the landing's close.
- 2026-10-11 — Built `/lab/wonder` (`app/(lab)/lab/wonder/page.tsx`, media in `public/lab/wonder/`). Same sticky stage as unfold; the brief is set in Cormorant across a dawn sky plate over a sea of clouds with a citadel; nouns open round-headed arched windows; the set gathers into a triptych floating on near clouds behind a slowly turning astrolabe ring; the arches flatten into timeline lanes. Near clouds and mist are generated cloud-on-black plates turned into tileable alpha layers that drift; the sky settles in once on load. The dawn palette is laid over the app tokens for this page only, so the reused landing sections show it too. Media: flux-pro v1.1 ultra for the sky, poster, clouds, mist, forest and a waterfall-bridge still (6 x about $0.06); wan 2.2 5b image-to-video for the waterfall teaser (static camera, 5 s, loops) and for the sky (3.4 s push-in, unused: it cannot loop); cassetteai for a 30 s ambient score (about $0.01). Generation scripts stayed in the session scratchpad; prompts to be moved into a repo script if this is chosen. Checked at 1440 and 390 at five scroll points plus the handoff; no console errors.
- 2026-10-11 — Owner on `/lab/unfold`: "I like the idea but not the current graphic", wants a "wonder" vibe: "medieval, cloud, mountain, nature ... nature and tech in between, like it gives u awe to look at". Next: `/lab/wonder`, the same unfold sequence in a new world. Dawn above a sea of clouds with peaks and a citadel (generated plates, flux-pro ultra, about $0.06 each; an image-to-video loop of the plate on wan 2.2 5b; an ambient score). Arched windows for the nouns, a triptych for the set, flattening into timeline lanes. Cormorant display, gold accent, cloud layers in parallax.
- 2026-10-11 — Built `/lab/unfold`: one sticky stage over 380svh. The brief types itself in Bricolage; each noun's window opens inline; on scroll the four windows fly to measured slots in a composition (poster, teaser, soundtrack, words), then into lanes on a 30-second timeline with a playhead that lights the score and taglines. Medium colours mark each noun, label and lane. The current landing's sections follow unchanged. Reduced motion shows the composition with no pinning. Checked at 1440 and 390 at five scroll points.
- 2026-10-11 — Owner: likes all three as better than the site, "feel like it can be a lot a lot more better"; liked the current landing (D-003) but "a bit too generic, just need something that wow's"; "def not the print one". Next study: `/lab/unfold`, D-003's base with one signature sequence: the brief types, its nouns open inline (Rebus), fly out into a full composition, and rearrange into the timeline on scroll (Multitrack).
- 2026-10-11 — Built `/lab/multitrack`, `/lab/print`, `/lab/rebus` (fonts DM Mono, Archivo
  at 62% width, Bricolage Grotesque, loaded only in `app/(lab)/layout.tsx`). Reviewed at 1440
  and 390: no overflow, no page errors. Tuned the print's misregistration (0.035em read as
  muddy at 230 px; now 0.014em) and moved the pink ink into the midtones so both inks show;
  fixed the rebus words window squeezing its text.

## Handoff
- **State:** `/lab/wonder` built and reviewed; waiting on the owner.
- **Blocked on:** the owner's verdict on `/lab/wonder`.
- **Next:** record the choice as a decision superseding D-003; restyle the landing and the
  app tokens to it; delete the other two studies and `public/lab` files they alone use.
- **Read first:** the three pages under `app/(lab)/lab/`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
