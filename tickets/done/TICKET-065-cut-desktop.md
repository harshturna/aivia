# TICKET-065: Cut on desktop: the player and the timeline

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
The Cut view: the player, the four-track timeline with trim, split, reorder, crossfades, text cards, audio, undo and zoom, autosave, Start a cut, export and Keep in project.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 061, 063, 064 (all done).
- Files: new `lib/timeline/ops.ts` and `start.ts` (+ tests); new `components/timeline/{player,
  timeline,inspector,cut-view}.tsx` and `use-player.ts`; new `app/(app)/p/[id]/cut/page.tsx`;
  `app/(app)/studio/studio-client.tsx` (the Make | Cut switch, Add to cut); `components/media/
  {actions,tray}.tsx` (Add to cut; the tray's footer slot for the selected item);
  `components/studio/run.tsx` (Cut it together opens Cut); `components/studio/cut.tsx` and
  `cut-render.ts` (the dialog goes: Cut replaces it); `lib/cut.ts` (planCut, alphaAt, CUT go:
  only the 061 parity test still read them); `app/(landing)/_landing/studio-demo.tsx` (copy).
- Decisions for v1, from §17.5 and the research: the main track is magnetic (items packed
  end to end, less their crossfades, from the first item's start, which may sit after a title
  card); text and audio items move freely; snapping to 0, the playhead and every item edge,
  8 px, rounded to frames; preview decodes with mediabunny (scrubbing by `getCanvas`, playing by
  per-item frame iterators on an AudioContext clock, the timeline's audio pre-mixed with the
  export's mixer); export through `renderTimeline`; cuts over 60 s cannot export.
- Below 1024 px Cut shows the player and Export with a note; the storyboard is TICKET-066. The largest ticket in the series; split it at planning if it grows past one commit's worth.

## Plan
- [x] `lib/timeline/ops.ts`: pack the main track; add to main (at an index), to text, to
      audio; move (main reorders, others move); trim start and end (clamped to the media and
      a 200 ms minimum); split at a time; remove (ripple on main); crossfade on and off;
      update an item's text, style, volume, fades, push; snap. Tests for each.
- [x] `lib/timeline/start.ts`: a project's starting cut, from a run (the template) or empty.
- [x] The player: a canvas at the cut's shape, scrub and play, time and length, Space.
- [x] The timeline: ruler, playhead, four rows, items with filmstrip-free blocks, select,
      drag, trim handles, split (S, ⌘B), delete, crossfade toggle, undo and redo (⌘Z, ⇧⌘Z),
      zoom (⌘ wheel, − +, Fit), frame step (← →).
- [x] The inspector at the tray's foot: a text card's words and style; a clip's crossfade; an
      audio item's volume and fades; a still's length and push.
- [x] The Cut view at `/p/[id]/cut`: Make | Cut in the header; load the project's cut, or
      Start a cut; autosave (edits API with rev; the guest in the browser), "Saved", a
      conflict message; Export (progress, Cancel, Download, Keep in project); the 60 s cap.
- [x] Add to cut from any piece in a project (tray, thread); Cut it together opens Cut; the
      dialog and `cut-render.ts` go; `planCut` goes.
- [x] Landing: the Studio section's copy says the cut can be edited.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright in use at 1440 and 1024: start
      a cut from the forest example, play, scrub, trim, split, reorder, delete, undo, change the
      title card's words, crossfade off, autosave and reload (guest: from the browser), export
      and compare length with the doc; screenshots; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Ops and tests landed (15). `moveMain` gave no crossfade to a former opener;
  it now tracks the opener. The player is `use-player.ts` (no separate `player.tsx`): frames by
  mediabunny iterators, scrubbing by `getCanvas`, sound from one pre-mixed buffer on an
  AudioContext clock, cached per audio layout.
- 2026-10-11 — In use: the timeline was too short for the Sound row (272 px now); a click in
  the tray added to the cut by accident, so adding is a drag or Add to cut only; the stage
  opened black at 0:00, so a cut opens a second in. The 0:00 tick was clipped under the row
  labels, and the save status wrapped at 1024 (it shows from 1280, errors always).
- 2026-10-11 — web-design-guidelines: timeline items selectable by keyboard (Enter/Space),
  the stage canvas given `role="img"`, the inspector's fields named with autocomplete off.


## Verification
- `npm run verify`: lint, typecheck, ticket check (68), 117 unit tests passed.
- `npx playwright test` (alone): 37 passed, 1 skipped; then the new
  "the Cut view starts a cut, fits, passes axe" passed on desktop and phone.
- Playwright in use as the guest (`.audit/t065/v2.mjs`, `exp.mjs`, `add.mjs`): Start a cut laid
  out title, clip, end card and score; scrub drew a picture; play advanced; split 4 → 5 items
  and undo back to 4; trim shortened the cut to 0:08; reorder put the poster before the
  waterfall; the title card's words changed; crossfade off; "Saved in this browser" and the same
  cut after reload; export 9.13 s at 960×528 for a 9047 ms doc, no Keep offered to the guest;
  Add to cut from the Make view's tray menu opened Cut with the piece; a drag from the tray onto
  the Picture row added a second item.
- Screenshots reviewed at 1440 and 1024 (`.audit/t065/added-1440.png`, `cut-1024.png`).
- Not exercised: Keep in project and the edits API save path from a real account (no
  non-guest account here); the API itself was checked in TICKET-064.

## Outcome
Shipped: `/p/[id]/cut` with Make | Cut in the project header; the player; the four-track
timeline with move, magnetic reorder, trim, split, remove, crossfades, text cards, snapping,
zoom and undo; the inspector at the tray's foot; autosave (account edits with rev and a
conflict message; the guest's in this browser); Start a cut from a run; export with progress,
Cancel, Download and Keep in project; the 60 s cap. Add to cut from the tray and thread, drag
from the tray, and Cut it together open Cut; the old dialog, `cut-render.ts` and `planCut` are
gone. The landing's Studio copy says the cut can be edited.

Left out: the missing-source state (§17.9, a struck-through item; follow-up TICKET-069) and New
take (TICKET-068).
Below 1024 the Cut view shows a note in place of the timeline until TICKET-066.
