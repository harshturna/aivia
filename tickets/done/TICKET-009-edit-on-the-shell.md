# TICKET-009: - [ ] `/edit` with the workspace, tabs, fields per tool, the limit inline, the slider, download.
- [ ] `?asset=` from the library and the Studio's edit action; `?tool=` from the redirect.
- [ ] Delete the old route group and components; remove dead utility classes.
- [ ] Verify: `npm run verify`; one transformation in the browser; `npm run shots`; keyboard
      pass of the tabs and the slider.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Edit: the transformations on the shell

## Context
The Cloudinary transformations become `/edit` (design §7): a two-pane workspace with upload
or a library pick on the left, the result on the right, tabs for the five tools, inline
limits, a before/after slider, and the `?asset=` and `?tool=` entries.
- Landing: add the Edit panel to `app/(landing)/_landing/sections.tsx` (design §11.6) once the screen exists, with a real before and after.

## Plan
- [x] `lib/edit.ts` (the five tools, what each needs, the fill size, the Cloudinary options)
      with five tests.
- [x] `/edit`: the tool tabs, the source by upload (the existing unsigned preset) or from the
      library (`?asset=`, copied into Cloudinary by URL), the fields per tool, one action
      named for the tool, the limit check inline, the result with a before-and-after slider
      (a range input, so the keyboard works), retries while a generative edit is still
      being made, download.
- [x] `?tool=` picks the tab; `/transformations/:tool` redirects there; Edit in the sidebar
      and in the lightbox for images; Pill no longer sets `aria-pressed` on tabs and radios.
- [x] Deleted: the transformations route, its five components, the type file, the
      transformation constants, the shimmer, debounce, merge and size helpers.
- [x] Verify: `npm run verify`; the redirect; a library image imported and its background
      removed in the browser; screenshots at 1440 and 390.
- The landing's Edit panel moves to TICKET-017.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built and tested with one real background removal (a Cloudinary transformation on the guest's allowance).

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-010 (Characters on the shell)
- **Read first:** `components/edit/workspace.tsx`, `lib/edit.ts`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, tests pass (edit 5 new)
playwright, as the guest:
  /transformations/removeBackground → /edit?tool=removeBackground
  /edit?tool=removeBackground&asset=<harbour> → the image copied into Cloudinary
  "Remove the background" → the result loads; the slider shows Before and After; Download
  at 390: scrollWidth 390; no page errors
```
Not run: restore, recolor, remove and fill (each a Cloudinary generative call); they differ
only in the options `lib/edit.ts` maps, which are tested.

## Outcome
Shipped: Edit on the shell per design §7, reachable from the sidebar, the library and the
old URLs; the old transformations code removed; a changelog line. Left out: the landing's
Edit panel (TICKET-017). No new tickets.
