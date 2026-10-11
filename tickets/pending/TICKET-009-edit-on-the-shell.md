# TICKET-009: - [ ] `/edit` with the workspace, tabs, fields per tool, the limit inline, the slider, download.
- [ ] `?asset=` from the library and the Studio's edit action; `?tool=` from the redirect.
- [ ] Delete the old route group and components; remove dead utility classes.
- [ ] Verify: `npm run verify`; one transformation in the browser; `npm run shots`; keyboard
      pass of the tabs and the slider.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Edit: the transformations on the shell

## Context
The Cloudinary transformations become `/edit` (design §7): a two-pane workspace with upload
or a library pick on the left, the result on the right, tabs for the five tools, inline
limits, a before/after slider, and the `?asset=` and `?tool=` entries.

## Plan
- Design §7, §3 (the `/transformations/:type` redirect from 004), D-002.
- Files: `app/(transformations)/**` (deleted), `components/transformations/*` (`TransformationForm`,
  `MediaUploader`, `TransformedImage`, `CustomField`, `Header` replaced), `lib/actions.ts`
  (the limit check stays), `constants.ts` (`transformationTypes`, `aspectRatioOptions` move to
  `lib/edit.ts`), the ~20 `.media-uploader*`, `.transformation*`, `.collection*` utility
  classes in `globals.css` (deleted in 003 if unreferenced, else here); new
  `app/(app)/edit/page.tsx`, `components/edit/{workspace,source,result,tool-tabs,fields,
  before-after}.tsx`.
- `next-cloudinary` 6 (`CldImage`, `CldUploadWidget`) kept; the unsigned preset stays.
- Ruled out: moving transformations to fal (a different product; Cloudinary's are instant).

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `docs/design/revamp.md`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
