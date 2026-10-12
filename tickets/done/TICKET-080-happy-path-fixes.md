# TICKET-080: Happy-path fixes from the second review

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** quality

## Goal
Nothing breaks or confuses in the usual workflows: the second review's happy-path findings fixed (the owner's priority, 2026-10-12: the main paths, not edge cases).

## Context
- Second review (2026-10-12), three reviewers: code of the fixes since cbe5fd4, desktop use,
  phone use (Chromium and WebKit). Every workflow ran end to end with no page errors; these broke
  or confused. Scripts and screenshots in `.audit/review2-*`.
- Findings:
  1. Space in Cut repeats the last clicked toolbar button (Split, Undo…) instead of playing: the
     TICKET-074 change skipped Space on any focused button (`cut-view.tsx` key handler).
  2. Saving an edit of a site picture opened by address can be refused: the page makes
     `/landing/x` absolute with the request's origin, the schema accepts it only at
     `NEXT_PUBLIC_APP_URL`'s origin (`.env` says 3000, dev runs on 3005).
  3. Cut's stage spills over the controls and timeline at 1440×800 and 1280×720: the canvas's
     `max-h-full` never applies inside its grid cell.
  4. New take in Cut on an example is lost: the take's run is kept only for a browser project, and
     the route never stores guest runs. Make's New take forks "(your copy)"; Cut should too.
  5. The editor's leave question is skipped when leaving by the sidebar.
  6. At 1024 the timeline does not fit when Cut opens with a saved cut (zoom starts at 60 px/s).
  7. Add to cut with no cut yet makes a one-piece cut and "Start a cut" is never offered.
  8. Phone: Add to cut from the Media sheet in Cut gives no sign (the sheet stays open on the piece).
  9. Phone: an image's action buttons draw over the sticky header (same z-index, later in the DOM).
  10. Landing: the Cut demo's time reads 0:04.2 while its playhead is still travelling.
- Ruled out (owner's priority): no Undo bar after "Remove from the cut" in the sheet (the header's
  undo works).
- Files: `components/timeline/cut-view.tsx`, `app/(app)/p/[id]/edit/page.tsx`,
  `lib/image-edit/schema.ts` (read), `components/editor/image-editor.tsx`,
  `components/shell/screen.tsx`, `app/(landing)/_landing/cut-scene.tsx`, `lib/guest-local.ts`
  (read), `components/timeline/start.ts` (read).

## Plan
- [x] 1: Space plays unless focus is on the Play button, a slider, a menu item or a field.
- [x] 2: a site picture opened by address keeps its relative `/landing/…` path in the doc (the
      schema accepts it at any origin); the stage loads it relative.
- [x] 3: the stage's canvas is sized to its area (an absolutely filled box, the canvas contained).
- [x] 4: a guest's take in Cut on a project not kept in this browser forks "(your copy)": a local
      session with the take's run and a local cut with the take swapped in, then opens it.
- [x] 5: while unsaved, a click on any in-app link asks first.
- [x] 6: a saved cut opens fitted to the timeline's width.
- [x] 7: Add to cut with no cut starts from the template and adds the piece (or selects it if the
      template already holds it).
- [x] 8: an action taken from the Media sheet in Cut closes the sheet.
- [x] 9: the screen header sits above the page's content.
- [x] 10: the demo's time reads 0:04.1 when the playhead arrives.
- [x] Verify: `npm run verify`; `npx playwright test` alone; each repro rerun in the browser.

## Progress log
- 2026-10-12 — Written from the second review; started.
- 2026-10-12 — Built. Space plays from anywhere in Cut except the play button, a slider or a menu
  item. Site pictures keep their relative path in the editor. The stage's canvas sits in an
  absolutely filled box (lg), so `max-h-full` holds. A guest's take on a project not kept in this
  browser saves a local session "<title> (your copy)" with the run and a local cut with the take,
  then opens it. While unsaved, the editor catches in-app link clicks in capture and asks. A cut
  opens fitted once. Add to cut with no cut builds the template from the project's runs and adds the
  piece, or selects it when the template holds it. Add to cut and New take from the phone's Media
  sheet close it. The screen header is z-20. The landing demo's time reads 0:04.1 when the playhead
  arrives. Tests: the Cut view's unit tests mock the router; the e2e take test now expects the copy.

## Verification
- In the browser (`.audit/t080/check.mjs`): Add to cut on the forest's poster with no cut gave the
  layout (card, clip, poster, score; 4 items); the stage's foot sat above the controls at
  1440×800 (468 < 485), 1280×720 (388 < 405) and 1440×900 (568 < 585); Space after clicking Split
  played and left 5 items at 5; New take on the example opened "A forest older than memory (your
  copy)" in Cut with the take swapped in, and its run is in that copy's Make; a saved cut at 1024
  opened with its last item inside the edge (692 < 724); the editor asked "Leave without saving?"
  on the sidebar's Library link; on a phone Add to cut from the sheet closed it (shots 2 → 3); after
  tapping an image under the header, the header is the top element.
- `npm run verify`: lint, typecheck, ticket check (80), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.

## Outcome
Shipped: the ten happy-path findings of the second review fixed. Left out by the owner's
priority: an Undo bar after "Remove from the cut" in the sheet.
