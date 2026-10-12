# TICKET-074: Cut: layout and behaviour

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Cut behaves like an editor: a real export dialog, shortcuts that do one thing, Fit that fits, the room the design gives it, and phone landscape that works.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings:
  - Export overlay is a div: no role, no focus trap, Esc does nothing; Space and Delete reach the
    timeline behind it; the sidebar stays clickable mid-export (design, desktop, phone).
  - ⌘B splits and also collapses the sidebar (`sidebar.tsx:64`, `cut-view.tsx:403`).
  - Fit leaves the end of the cut off-screen (it assumes 900 px).
  - Cut does not collapse the sidebar to the rail (§17.2).
  - Phone landscape: the stage fills the height, the storyboard is 0 px (`max-h` on the stage).
  - Crossfades dip toward the background at the midpoint (`layout.ts:42-51`): hold the
    outgoing item at full alpha through the incoming item's fade; short items get a fade longer
    than their overlap; `split` allows halves under `MIN_ITEM_MS`.
  - The score runs past the end of the cut after trims (template score length).
  - A title card overlaps the end card's words after a reorder; same on the phone at 0.2 s.
  - No way to scrub on the phone; time shows whole seconds so a frame step looks like nothing.
  - The Make|Cut switch moves between views; zoom ignores its anchor; selecting an item scrolls
    the timeline sideways; + and − never disable; Add to cut in Cut gives no feedback.
  - Space toggles playback while a button has focus; no keyboard way to move or trim on the
    desktop timeline; the shortcuts help leaves out Cut's keys and ⌘.
  - Export is the source clip's size, not the 720p §17.5 says.

## Plan
- [x] Export on the shared Dialog; shortcuts off while it is open.
- [x] ⌘B is split inside Cut only (the sidebar's handler yields there), or S alone with ⌘B
      dropped from §17.5: decide in the progress log.
- [x] Fit measures the timeline's width; the sidebar collapses on entering Cut and restores.
- [x] Stage capped by height on short screens.
- [x] Crossfade alpha fixed in `layout.ts` (one path: player and export); fade clamped to the
      overlap; `split` minimum.
- [x] The template score ends with the cut; cards keep out of each other's way.
- [x] A scrub bar on the phone; tenths in the time readout; the view switch anchored by the
      title; zoom limits and anchor; keyboard move and trim; shortcuts help updated.
- [x] Export at 1280×720 (fit inside, letterboxed).
- [x] Files (read): `components/timeline/cut-view.tsx` (export modal, keys, controls, stage,
      fit, addPiece), `components/timeline/timeline.tsx` (zoom, selection, end of cut),
      `lib/timeline/layout.ts` (`mainFades`), `lib/timeline/ops.ts` (`split`),
      `components/timeline/compositor.ts` (still words under a caption card),
      `components/timeline/export.ts` (export size), `components/shell/sidebar.tsx` (rail in Cut,
      ⌘B), `lib/shortcuts.ts`, `components/ui/dialog.tsx`, `lib/duration.ts`. Tests: layout and
      split units; the rest in the browser.
- [x] Decisions: ⌘B splits inside Cut (the Cut view takes the key first, in capture, and the
      sidebar yields when it was taken), as §17.5 says; the sidebar's rail in Cut does not touch
      the person's saved choice. The score past the end is shown as past the end (the cut ends
      where its picture and words end; the mix already stops there), not trimmed for them.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started; files read, decisions in the plan.
- 2026-10-11 — Built. Crossfades: the incoming item fades in over the outgoing one, which
  holds (`mainFades`), the fade never longer than the overlap; `split` keeps both halves at
  `MIN_ITEM_MS`. A card on screen holds back a still's own words (the compositor). Export is a
  `Dialog` (focus trapped, Esc cancels a render or closes, keys behind it held); Cut's keys run
  in capture so ⌘B splits and the sidebar yields (`defaultPrevented`); Space on a focused button
  presses it; ⌥←/→ moves the selected piece, `[` and `]` trim it to the playhead; the playhead
  is read to the millisecond (`player.now()`). The sidebar is the rail in Cut without touching
  the saved choice. Fit measures the timeline's width; zoom − and + stop at their limits; ⌘-wheel
  zoom keeps the moment under the pointer. The end of the cut is marked and what runs past it is
  dimmed. The time reads to tenths. Phones get a playhead slider; the stage is capped at 45dvh
  below lg (landscape). An added piece is selected and scrolled into view. The Make | Cut switch
  sits beside the title (`ScreenHeader` `beside`). Export writes 1280 wide. The shortcuts list
  names Cut's keys and ⌘.
- 2026-10-11 — e2e caught a real bug the rail now shows in Cut: the account button on the rail
  had no name; it says "Account: <name>" there.
- 2026-10-11 — "Selecting an item scrolls the timeline sideways" did not reproduce after the
  changes; selection now only scrolls when the piece is off to one side.

## Verification
- Units: `lib/timeline/timeline.test.ts` gains "a crossfade": at the middle the outgoing picture
  is at 1 and the incoming at 0.5 (before: 0.5 and 0.5, the dip); a 200 ms item's fade ends with
  the overlap; a split 150 ms in is refused.
- `npm run verify`: lint, typecheck, ticket check (79), 162 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped (after the rail's account button fix).
- In the browser (`.audit/t074/cut.mjs`, `cmdb.mjs`, `phone.mjs`): sidebar 232 → 52 px on
  entering Cut and 232 again in Make; ⌘B at 0:03.0 split (4 → 5 items) with the sidebar left at
  52; Fit put the last item's right edge at 1108 inside the 1140 edge; ⌥→ swapped the two
  pictures; `[` trimmed the clip from "0:01 to 0:06" to "0:03 to 0:06"; Space on the focused Fit
  button did not play; Export opened a dialog with focus inside, Delete and Space did nothing
  behind it, Esc closed it; the exported MP4 is 1280×704; the time reads "0:01.0 / 0:09.0";
  at 844×390 the stage is 176 px tall and the shots are reachable; the phone's playhead slider
  moved the cut to 0:04.0. Screenshots: `.audit/t074/cut-1440.png`, `phone-844.png`.

## Outcome
Shipped: crossfades without the dip; fades clamped; a real export dialog; ⌘B as split in Cut;
the rail in Cut; Fit that fits; anchored zoom with limits; the end of the cut marked; tenths;
a phone playhead and a landscape-safe stage; keyboard move and trim; added pieces shown; the
view switch anchored; 1280-wide export; Cut's keys in the shortcuts; the rail's account button
named.

Left out: frames on picture items (TICKET-077); the phone tab bar (TICKET-076).
