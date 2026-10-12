# TICKET-068: New take

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
On a selected clip or still in Cut, New take reruns its brief in its mode and swaps the result in place, the old piece kept in the tray.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 065 (done). Through `lib/ai/guard.ts`; the cost on the button.
- How a piece is made again today: the Make view's `retryPiece` (TICKET-051) sends the piece's
  prompt as a run of its own in its direct mode (`pieceRequest` in `studio-client.tsx`), to
  `/api/generate`, which guards the cost (`guardGeneration`: 429 guest limit, 403 trial over),
  streams one tool part, keeps the asset and, signed in, saves the project's messages whole.
  A run's user message carries what it was sent with (`metadata: {mode, params, scene}`), and an
  Animate run carries its still as a file part.
- Files: new `components/studio/piece-request.ts` (`pieceRequest` moved out of the Make view,
  plus `takeFor`: the request that makes a piece of a cut again, found by its address);
  new `components/timeline/take.ts` (`makeTake`: posts the run to `/api/generate`, reads the
  stream, returns the new piece and the messages); `lib/timeline/ops.ts` (`replaceMedia`, +
  test); `components/timeline/cut-view.tsx` (New take on the selected item and from the tray;
  the take's state; the messages updated, the guest's local session saved);
  `components/timeline/inspector.tsx` (the button, its cost, its state);
  `components/timeline/storyboard.tsx` (the sheet passes it through);
  `components/media/actions.tsx` (a `newTake` handler and action, cost named);
  `app/(app)/studio/studio-client.tsx` (New take in the Make view = the piece's retry);
  `app/(landing)/_landing/studio-demo.tsx` (the lede); `lib/guest-local.ts` (read only).
- Decisions: a take is a run in the project, made through the same route as every direct run,
  so the thread, the tray, the asset and the cost behave as they do in Make; it is made from
  inside Cut (no trip to Make), and the result swaps into every item that used the old piece,
  as one undo step. A direct-mode run is repeated as it was sent (with an Animate's still); a
  piece an Auto run made is repeated in its direct mode from its tool call. One piece per take
  (an image run of four makes one). A guest on a pinned example keeps the take in the cut and
  this visit's tray only (the example is not theirs to add to).
- Ruled out: editing the prompt before a take (that is Reuse prompt in Make); takes on audio
  (§17.5 names clips and stills).

## Plan
- [x] `piece-request.ts`: `pieceRequest` moved, `takeFor(messages, url)`. Tests.
- [x] `replaceMedia(doc, oldUrl, media)`: every item on that piece takes the new one, its
      length kept where the new source allows. Test.
- [x] `take.ts`: `makeTake` (the stream read with the SDK's own parser; limits and failures
      as messages).
- [x] Cut: New take in the inspector (desktop and the storyboard's sheet) with "Uses 1
      generation"; "Making a new take…"; the swap as one undo step; the tray's New take; the
      messages and the guest's local session updated.
- [x] Make: New take in the "⋯" of a clip or still (the piece's retry).
- [x] Landing: the Studio section's lede names it.
- [x] Verify: `npm run verify`; `npx playwright test` alone; Playwright in use with
      `/api/generate` stubbed (no money): New take on the clip at 1440 and on the phone's sheet
      at 390 swaps the item, the old piece stays in the tray, undo puts it back; the guest limit
      shows; Make's "⋯" New take sends one run; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built `piece-request.ts` (moved `pieceRequest`; `takeFor`), `replaceMedia`,
  `take.ts` (the SDK's `parseJsonEventStream` and `readUIMessageStream` over the route's
  stream), New take in the inspector, the storyboard's sheet and the tray's "⋯" in Cut, and in
  Make's "⋯" (the piece's own run, one piece). The header says "Making a new take…" at every
  width, so a take started from the tray is visible too.
- 2026-10-11 — In use: Make's take of the forest poster went out at 1:1. The seeded examples'
  tool calls name no shape, so the composer's current choice filled in; a take now keeps the
  piece's own shape (measured on the page, or probed in Cut) when its run named none.

## Verification
- `npm run verify`: lint, typecheck, ticket check (70), 141 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped (the New take test is desktop only), with
  "New take swaps a clip in the cut (generation stubbed)": the clip swapped, axe clean, undo
  took it back.
- Playwright in use as the guest, `/api/generate` stubbed with a canned stream, no money spent
  (`.audit/t068/take.mjs` at 1440 and 390): on the forest's clip, New take with "Uses 1
  generation" showed "Making a new take…", sent one request (video, `videoAspect` 16:9, the
  project's id, the clip's prompt as the brief, the project's messages plus one); the clip
  became "A second take of the waterfall" in place; the tray gained the take's group, the old
  clip still in it; undo put the old clip back; a 429 showed the guest limit. The same from the
  storyboard's sheet at 390.
- Make (`.audit/t068/make.mjs`): "⋯" on the poster lists "New take 1 generation"; it sent one
  run, image, count 1, aspect 3:4 (the poster's own shape), and the thread gained the run.
- Screenshot reviewed: `.audit/t068/after-1440.png`.

## Outcome
Shipped: New take on a clip or still, from the Cut inspector, the storyboard's sheet, and "⋯"
in the tray (Cut swaps it in place in every item that used the piece, as one undo step; Make
makes the piece again as a run). One piece per take, through the same direct route and guard,
its cost named; the run joins the project's thread and tray (the guest's local copy too); the
piece's shape is kept. The landing's Studio lede names it.

Left out: editing the prompt before a take (Reuse prompt in Make does that); takes on audio.
