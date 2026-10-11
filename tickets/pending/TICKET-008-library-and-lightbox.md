# TICKET-008: - [ ] Page, filters in the URL, day groups, masonry, audio rows, cursor loading, empty state.
- [ ] Lightbox as an intercepting route with the panel's actions (open session, download, use
      as reference, edit, favourite, delete).
- [ ] Verify: `npm run verify`; `npm run shots` at 1440 and 390; keyboard pass of the
      lightbox; a direct load of `/library/a/[id]` renders the full page.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Library and the lightbox

## Context
`/library` shows everything a user made, by day, filterable by kind, searchable by prompt,
with favourites, and a lightbox at `/library/a/[id]` that is a shareable URL (design §6).

## Plan
- Design §6, §12 (the assets route), §13 (empty state), TICKET-005's data.
- Files: new `app/(app)/library/page.tsx`, `app/(app)/library/@modal/(.)a/[id]/page.tsx`
  (intercepting route), `app/(app)/library/a/[id]/page.tsx` (the full page when opened
  directly), `components/library/{filters,day-group,masonry,asset-tile,audio-list,
  lightbox,lightbox-panel}.tsx`; the Studio's image "expand" and the sidebar's "All sessions"
  point here.
- Pagination by cursor (`createdAt, id`), 48 per page, `IntersectionObserver` at the end;
  the segmented control and search live in the URL (`?kind=&q=&fav=`).
- The lightbox traps focus, closes on Esc and on the scrim, restores focus; arrow keys move
  between assets of the current list.
- Ruled out: infinite masonry libraries (CSS columns are enough at this scale).

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
