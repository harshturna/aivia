# TICKET-072: Paid actions: one charge per click, takes that make the right thing

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
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
- [ ] An in-flight ref set synchronously, the button disabled on the first click, in the
      editor's AI panel and in Cut's New take (inspector and tray).
- [ ] AI steps applied to the latest doc; a run survives a tab switch; Fill refits the crop.
- [ ] `takeFor` returns null for a data: still; menus ask `canTake`; failed takes keep the
      messages; Make measures with `new Image()`; `durationSeconds` read.
- [ ] A fork from an example keeps the example's title as "<title> (your copy)" and says so.
- [ ] Dead code removed.
- [ ] Before starting: read every file this touches, list them here, and make the steps
      concrete (CLAUDE.md rule 2). Each fixed finding gets a test that fails before the fix
      where it can be tested.
- [ ] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan.
- **Read first:** this ticket.

## Verification

## Outcome
