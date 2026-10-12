# TICKET-072: Paid actions: one charge per click, takes that make the right thing

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Every paid action charges once per intent and makes what it promises: the editor's AI tools and New take in Make and Cut.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings:
  - Double click charges twice: editor AI (`image-editor.tsx:1103`, desktop QA repro), New take
    in Cut (the in-flight check sits after an await, `cut-view.tsx:515-539`; projects review).
  - An AI result overwrites edits made while it ran and cuts redo (`image-editor.tsx:612,1103`);
    switching tabs mid-run shows the tool idle; Fill after a fixed-shape crop leaves the crop
    distorted (refit with `fitCrop`).
  - New take on a clip animated from an uploaded (data:) photo makes an unrelated 16:9
    text-to-video (`piece-request.ts:148-160`): offer no take there until photos are stored.
  - New take shown on edited images and kept cuts does nothing (`actions.tsx:107`): menus need
    the inspector's `canTake`.
  - A failed take is saved on the server but not in Cut's messages (`generate/route.ts:157`).
  - Make measures the piece from a lazy thread image (width 0): measure with `new Image()`.
  - Retry of a planned music/sound piece loses its length: tools write `durationSeconds`, not
    `seconds` (`piece-request.ts`, `lib/ai/tools.ts:134,171`).
  - New take on a pinned example from Make forks a new project named after the clip with no
    word to the user, while Cut swaps in place (desktop QA): say what happened, keep the
    project's own title.
  - Dead code: `StudioActions.animate` provided but unread; unused imports in `lightbox.tsx`.

## Plan
- [x] An in-flight ref set synchronously, the button disabled on the first click, in the
      editor's AI panel and in Cut's New take (inspector and tray).
- [x] AI steps applied to the latest doc; a run survives a tab switch; Fill refits the crop.
- [x] `takeFor` returns null for a data: still; menus ask `canTake`; failed takes keep the
      messages; Make measures with `new Image()`; `durationSeconds` read.
- [x] A fork from an example keeps the example's title as "<title> (your copy)" and says so.
- [x] Dead code removed.
- [x] Files read and touched: `components/editor/image-editor.tsx` (AI run lifted into the
      editor), `lib/image-edit/geometry.ts` (`withStep`) + test, `components/timeline/cut-view.tsx`
      (`runTake`, `canTake`), `components/timeline/take.ts`, new `components/studio/measure.ts`,
      `components/studio/piece-request.ts` + test, `components/media/actions.tsx` (`canTake`),
      `app/(app)/studio/studio-client.tsx` (newTake, fork title, actions), `components/studio/
      actions.tsx`, `components/studio/run.tsx`, `components/library/lightbox.tsx`.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started and built in one pass. Paid runs are claimed by a ref before anything
  awaits (the editor's `aiBusy`, Cut's `taking`), so a second click is a no-op; the button shows
  the working state from the first. The editor's AI state lives in the editor, not the panel, so
  it survives a tab switch, and its result is applied with `withStep` to the picture as it is
  now (a Fill refits a fixed-shape crop). `takeFor` returns null for a clip animated from a
  pasted (data:) photo or by an Auto run's animate call with no stored still; it reads the
  planner's `durationSeconds`. Menus show New take only where `canTake`. A take that ran and
  failed keeps its run in the view's messages, as the server does. Make and Cut measure the
  piece from its file (`measure.ts`). A take on a pinned example forks the guest's copy named
  "<example> (your copy)" rather than after the clip's prompt. Removed: `StudioActions.animate`
  (never read), unused imports in `lightbox.tsx` and `run.tsx`.
- 2026-10-11 — No toast for the fork: the app's toaster is unstyled for this design and used
  nowhere; the copy's title in the header and the sidebar says what happened.

## Verification
- Units: `components/studio/piece-request.test.ts` (5: a pasted-photo clip gets no take; a
  planned track keeps its 60 s), `lib/image-edit/image-edit.test.ts` (15: Fill refits a square
  crop on a 900×1600 result; a free crop and a same-shape result leave it).
- `npm run verify`: lint, typecheck, ticket check (78), 155 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped.
- In the browser with every paid route stubbed (`.audit/t072/paid.mjs`): a double click on
  "Restore the photo" spent once ("Applied so far: Restore."); words added while it ran stayed
  after the result; the working state showed after switching tabs and back; a double click on
  New take in Cut sent one run and showed the failure message; New take from Make's "⋯" on the
  forest example titled the copy "A forest older than memory (your copy)".

## Outcome
Shipped: one charge per click for the editor's AI and New take; AI results that keep what was
done meanwhile, and survive a tab switch; Fill refits a fixed crop; no take offered where it
would make the wrong thing (pasted-photo clips, edited images and kept cuts); failed takes kept
consistently; a take keeps the piece's shape from its file; planned tracks keep their length on
retry; a take's fork named for its example; dead code removed.

Left out: the server-signed AI cap (TICKET-073); the editor's no-op undo steps and unsaved
warnings (TICKET-075).
