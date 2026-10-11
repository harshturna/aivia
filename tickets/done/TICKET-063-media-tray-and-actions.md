# TICKET-063: The media tray and one set of item actions

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
The tray on the right of a project, grouped by brief, and one MediaActions definition per kind used in the thread, the tray, the Library and the lightbox, with multi-select, Use in a brief and Use a frame as an image.

## Context
- D-005; `docs/design/revamp.md` §17; research in `docs/design/research-media-platform.md`.
- Written by TICKET-060; the §17 design was approved by the owner on 2026-10-11.
- Files: new `lib/media.ts` (the item type, a file from a URL), new
  `components/media/actions.tsx` (one action list per kind; hover, menu and button renderings),
  new `components/media/tray.tsx`, `components/studio/outputs.tsx` and `audio-row.tsx` (the
  thread's actions), `app/(app)/studio/studio-client.tsx` (the tray beside the thread, drag
  and attach, a reference on arrival), `app/(app)/p/[id]/page.tsx` and `studio/page.tsx` (the
  tray's cookie, `?ref=`), `components/library/{library-client,lightbox}.tsx` (the same
  actions, multi-select), `app/(app)/edit/page.tsx` (`?url=` for an image without an asset).
- Scope cut, recorded: Add to cut and New take join the same definitions in TICKET-065 and
  TICKET-068 (no timeline yet); Delete stays in the Library and lightbox (deleting from a
  project would leave its run showing the piece); "Use a frame as an image" becomes **Use a
  frame in a brief** (it attaches the frame; saving it as an image needs storage, TICKET-064).
- Reads: `components/studio/outputs.tsx`, `components/library/*`, the composer's attachments.

## Plan
- [x] `lib/media.ts` and `components/media/actions.tsx`: image Open, Edit, Animate; Use in a
      brief, Reuse prompt, Download, Favourite. Clip Open, Use a frame in a brief, Download;
      Reuse prompt, Favourite. Sound Download; Reuse prompt, Favourite. An action shows only
      where its surface can do it; paid ones name their cost.
- [x] The thread uses it (images and clips get the same hover cluster, top right; audio rows
      a menu).
- [x] The tray: 300 px beside a project's thread at 1024 and up (collapsible, a cookie), a sheet
      below; grouped by brief; filters; Open scrolls the thread to the piece; drag to the
      composer attaches; ⌘/⇧-click selects, with Download for the selection.
- [x] The Library tiles and the lightbox use the same actions; Library multi-select (Download,
      Delete); Use in a brief opens Home with the piece attached (`?ref=`).
- [x] Edit accepts an image by address (`/edit?url=`) when it has no asset.
- [x] Landing: the Studio frame's right edge shows the tray.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright: the tray at 1440 and 1024, the
      sheet at 390, actions in thread, tray, Library and lightbox, drag and Use in a brief
      attach, a frame from a clip, selection download; screenshots; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from TICKET-060.
- 2026-10-11 — Started; files read, plan written with the scope cut above.
- 2026-10-11 — Built. Also: the Library's favourite heart became an indicator (favouriting is
  in the menu, with everything else); the thread's captions lost their Reuse and Download
  buttons (both are in the cluster now); the handler names avoid `use…` so they do not read as
  hooks. The full e2e run caught the tray's footer link relying on colour (axe
  link-in-text-block); it is underlined now.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-064.
- **Read first:** nothing

## Verification
```
npx vitest run lib/media.test.ts   # mediaByBrief: groups and order; failed, unfinished and
                                   # empty runs left out
node .audit/t063/v.mjs, v2.mjs, v3.mjs   # Playwright, guest, the forest example
  tray: visible at 1440 and 1024, 1 group, 3 pieces; a sheet with 3 pieces at 390;
    Open on the track scrolls it to the middle (scrollY 812, top 322 of 700); ⌘. hides it
    and the header's Media brings it back
  thread image cluster: Open, Edit, Animate (1 generation), More; menu adds Use in a brief,
    Reuse prompt, Download
  attachments: Use in a brief 1, a frame from the clip 2, a drag from the tray 3
  library: the same cluster; ⌘-click selects two, bar "2 selected | Download | Clear";
    Use in a brief → /studio?ref=… with the piece attached
  lightbox (image): Edit, Animate 1 generation, Use in a brief, Reuse prompt, Download,
    Open the project
  /edit?url=/landing/tree.jpg starts the import
npm run verify     # 95 unit tests: pass
npm run test:e2e   # 37 passed, 1 skipped (after the link fix; the saved-project axe check
                   # failed once on link-in-text-block)
```
Screenshots reviewed: `.audit/t063/project-1440.png`, `project-attached-1440.png`,
`project-1024.png`, `project-390.png`, `library-selected-1440.png`. web-design-guidelines over
the changed code: no further findings.

## Outcome
Shipped: one action set per kind (`components/media/actions.tsx`) used by the thread, the new
media tray, the Library and the lightbox; the tray beside a project (sheet below 1024, ⌘.);
attaching a piece or a clip's frame to the brief by menu or drag, and from the Library via
`?ref=`; Library multi-select with Download and Delete; Edit by address; the landing frame's
tray column. Left out: Add to cut and New take (TICKET-065, TICKET-068); saving a frame as an
image (needs TICKET-064).
