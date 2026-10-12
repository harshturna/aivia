# TICKET-067: The image editor

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Edit on any image opens the editor over the project's stage: crop, adjust, text and the AI tools as steps on the source; Save makes a version; `/edit` redirects.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Depends on 063, 064 (done). 065 and 066 done (`3bf93a4`, `bf70e59`).
- Today: `/edit` (`app/(app)/edit/page.tsx`, `components/edit/workspace.tsx`) is a separate page
  of five Cloudinary tools (`lib/edit.ts`: Restore, Remove background, Recolor, Remove object,
  Fill), each spent through `/api/edit/spend`; the source is copied to Cloudinary by URL with
  the unsigned preset `aivia_transformation`; nothing is kept but a download. Edit is in the
  sidebar (`components/shell/nav-items.ts`), the palette (`command-palette.tsx` "Edit a photo"),
  `app/robots.ts`, the e2e screens list and `scripts/shots.mjs`. The Make view's and the
  Library's Edit go to `/edit?asset=` or `?url=`.
- The tray's groups come from the thread (`mediaByBrief`), so a saved edit or a kept cut
  (assets with model `aivia/edit`, `aivia/cut`, TICKET-064/065) never shows in it today.
- Files: new `lib/image-edit/{schema,matrix,geometry}.ts` (+ tests); new
  `components/editor/{image-editor,crop-box,render,ai}.tsx|ts`; new
  `app/(app)/p/[id]/edit/page.tsx`; `app/(app)/edit/page.tsx` (becomes a redirect);
  `components/edit/workspace.tsx` (goes); `lib/edit.ts` (kept: the AI tools' mapping);
  `lib/edits.ts`, `app/api/edits/route.ts` (image docs: `kind`, validation by kind);
  `lib/assets.ts` (`listVersions`); `app/(app)/p/[id]/page.tsx`, `app/(app)/p/[id]/cut/page.tsx`,
  `app/(app)/studio/studio-client.tsx`, `components/timeline/cut-view.tsx` (the versions group
  in the tray; Edit opens the editor); `components/media/library-handlers.ts`;
  `components/shell/{nav-items,command-palette}.ts(x)`; `app/robots.ts`;
  `tests/e2e/screens.spec.ts`; `scripts/shots.mjs`; `app/(landing)/page.tsx`, new
  `app/(landing)/_landing/editor-demo.tsx`, `studio-demo.tsx` (its sidebar lists Edit).
- Decisions:
  - The editor is a route in the project, `/p/[id]/edit?src=<asset id or address>`, beside
    Make and Cut, with the tray. This replaces §17.7's `?edit=` on the Make view: same
    address-in-the-URL and Back behaviour, without folding a third screen into the Make view's
    component. §17.7 is updated to say so.
  - One render path (`render.ts`) for the preview and Save, as the cut has: rotate and flip,
    crop (fractions of the turned image), the colour matrix on the pixels, the words.
  - The crop box is ours (free and fixed shapes, drag, corners, arrow keys), not
    react-easy-crop: that library has no free shape, and a box over the picture is all v1 needs.
  - AI tools are steps: each runs on the current base (the source or the last AI result), is
    spent through the same guard, and its result becomes the base; undo removes it.
  - Save: signed in, the picture goes to storage (`uploadMedia`, `/api/uploads` with the
    parent asset and the edit id) and the steps to a new image Edit, so the version reopens
    editable; the guest downloads (§17.8).
  - Versions in the tray: the project's `aivia/edit` and `aivia/cut` assets as one group,
    "Edits and cuts", at the top of the tray in Make, Cut and the editor.
- Ruled out (v1, §17.7): layers, brushes, masks, filter gallery, compositing, stickers, prompt
  edits; an upload of an outside photo (the old page took one; the tray's Upload is not built,
  follow-up TICKET-070).

## Plan
- [x] `lib/image-edit/schema.ts` (zod doc: source, ai steps, rotate, flip, crop, adjust,
      texts), `matrix.ts` (brightness, contrast, saturation, warmth as one 4×5 matrix; applied
      to pixels), `geometry.ts` (turned size, a shape's largest centred crop, clamps). Tests.
- [x] `components/editor/render.ts`: the doc on a base image to a canvas, with the words'
      boxes for the stage to hit-test.
- [x] `crop-box.tsx`; `image-editor.tsx`: Back, the title, undo and redo, Cancel, Save (the
      guest: Download); the stage (hold to compare); Crop (shapes, rotate, flip, Reset), Adjust
      (four sliders, Reset), Text (add, words, face, colour from the tokens and tints, size,
      drag), AI (the five tools, each naming its cost, as steps).
- [x] `ai.ts`: import a base to Cloudinary once, spend, build the URL, wait for it.
- [x] Image docs in `lib/edits.ts` and `/api/edits`; `listVersions`; Save end to end.
- [x] `/p/[id]/edit`: the source by asset id (reopening a version's steps) or by address;
      the tray (Edits and cuts on top), a tray image opens in the editor.
- [x] Edit everywhere opens it: the Make view, the Library and lightbox (by project);
      `/edit?asset=` redirects there, `/edit` alone to Home; the workspace goes; Edit leaves the
      sidebar, the palette and robots; the e2e list and shots move to the new route.
- [x] Landing: a section, a still becoming a poster with its words (replayed, reduced motion
      settles on the poster); the Studio demo's sidebar loses Edit.
- [x] Verify: `npm run verify`; `npx playwright test` alone (a new editor test: opens from an
      example, axe, at 1440 and 390); Playwright in use: crop to 3:4, rotate, adjust, add words
      and drag them, undo, hold to compare, Save as the guest downloads a file whose size
      matches the crop; an AI tool with the spend stubbed (no money); `/edit?asset=` redirects;
      `npm run shots`; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written. Not split: the AI tools must move with the
  page they leave, and the rest is one editor.
- 2026-10-11 — Built: `lib/image-edit/` (schema, matrix, geometry, sources; 13 tests),
  `components/editor/` (render, ai, crop-box, image-editor), the route, image docs in the edits
  API (`checkImageDoc`; PUT refuses to change an image edit), `listVersions` and
  `versionItems`/`withVersions` (the tray's "Edits and cuts" in Make, Cut and the editor).
  The Library keeps `/edit?asset=`, which now redirects into the project.
- 2026-10-11 — In use: words ran past the picture's edges (the render now wraps them to 90% of
  the width); on a phone the title read "Editing “A …" (it says "Edit" there) and the compare
  button covered the picture and the words (it moved into the tools row, "Compare" on phones);
  axe then found it inside the tablist (`aria-required-children`), so it sits beside it.
  Lint: the crop box is a button, the colours are toggle buttons in a fieldset.
- 2026-10-11 — web-design-guidelines: arrow keys between the tool tabs (roving tabindex),
  "Opening the picture…" while it loads, leaving with unsaved changes asks first
  (`beforeunload`), every field named with autocomplete off, cost named on the AI button row.
- 2026-10-11 — Landing: "Then make a still into a poster." (`editor-demo.tsx`): the tree
  cropped to 3:4, warmed, and given ink words over the sky, once in view; reduced motion shows
  the poster. Cream words were lost on the meadow, so the demo uses the Ink colour, which the
  editor offers. The Studio demo's sidebar matches the app's (Home, Library, Characters).

## Verification
- `npm run verify`: lint, typecheck, ticket check (70), 135 unit tests passed (then the edits
  test gained an image-doc case: 5 passed).
- `npx playwright test` (alone): 41 passed, 1 skipped, with the new "the image editor opens on a
  picture, fits, passes axe" (open, then the Text tools with words) and "an old Edit address
  opens the picture in its project", on desktop and phone.
- Playwright in use as the guest (`.audit/t067/ed.mjs` at 1440 and 390): Edit in the Make
  view's tray menu opened `/p/<forest>/edit?src=<poster>`; 3:4 cropped the 1200×1800 poster to
  1200×1600; Warmth +40 moved red over blue; words added, dragged 150 px, undone and redone;
  Rotate turned the canvas to 1600×1200 and undo back; holding Compare showed the original and
  releasing hid it; Download saved a 1200×1600 JPEG.
- AI with Cloudinary and the spend stubbed, no money spent (`.audit/t067/ai.mjs`): Restore
  copied once, spent once, and became the base (the canvas took the stub's shape); Remove object
  stayed disabled until told what; a second step ran on the first's result; undo took it off;
  a 429 spend showed the guest limit with Create an account.
- Redirects (`.audit/t067/redir.mjs`): `/edit?asset=<poster>` → `/p/<forest>/edit?src=<poster>`;
  `/edit` and `/edit?asset=nope` → `/studio`; `?src=https://evil.example/x.jpg` → `/p/<forest>`;
  the Library item's Edit → the editor; no Edit in the sidebar.
- Screenshots: `.shots/state-editor@1440x900.png`, `state-editor-words@390x844.png` and the
  landing section at 1440, 390 and 390 with reduced motion (`.audit/t067/landing-*.png`).
- Not exercised: a signed-in Save (storage upload, the image Edit, the version in the tray,
  reopening it with its steps); there is no non-guest account here. The route, the API's
  validation and the version query are covered by the checks above and the unit tests.

## Outcome
Shipped: the image editor at `/p/[id]/edit?src=`, opened by Edit everywhere: Crop (six shapes,
our own box, rotate, flip), Adjust (brightness, contrast, saturation, warmth as one colour
matrix), Text (boxes in two faces and six colours, size, drag, arrow keys), AI (the five tools
as steps, each through the guard with its cost named), undo and redo, hold to compare, one
render for the stage and Save. Save keeps a version in the project with its steps (reopens
editable); the guest downloads. Saved edits and kept cuts show at the top of the tray in Make,
Cut and the editor. `/edit` redirects; the old workspace, the sidebar's and the palette's Edit
are gone. The landing gains the editor section.

Left out: uploading an outside photo (follow-up TICKET-070); New take is TICKET-068.
