# TICKET-008: - [ ] Page, filters in the URL, day groups, masonry, audio rows, cursor loading, empty state.
- [ ] Lightbox as an intercepting route with the panel's actions (open session, download, use
      as reference, edit, favourite, delete).
- [ ] Verify: `npm run verify`; `npm run shots` at 1440 and 390; keyboard pass of the
      lightbox; a direct load of `/library/a/[id]` renders the full page.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Library and the lightbox

## Context
`/library` shows everything a user made, by day, filterable by kind, searchable by prompt,
with favourites, and a lightbox at `/library/a/[id]` that is a shareable URL (design §6).

## Plan
- [x] `/library`: the kind tabs, search (debounced) and favourites in the URL; day groups in
      the viewer's time zone; images and clips in CSS-columns masonry with the blur reveal,
      clips playing on hover, a favourite control per tile; audio as rows; cursor loading
      as the end nears; an empty state for nothing made and for nothing matching.
- [x] The lightbox as an intercepting route over the grid (`@modal/(.)a/[id]`) and as a page
      when opened directly (`a/[id]`): the media, the prompt, when it was made, its size or
      length, download, favourite, open the session, delete with a second step; as a modal
      it traps focus, closes on Esc, the scrim and the close button, and gives focus back.
- [x] Library in the sidebar.
- [x] Verify: `npm run verify`; screenshots at 1440 and 390; the modal opened and closed;
      a direct load; a cached reload; no page errors.
- Left out: arrow keys between assets in the lightbox (needs the list in the modal); the
  Studio's expand still opens the file at full size, since a run's output does not carry its
  asset id.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built. Found in the browser: a hydration error from formatting dates in the
  server's time zone (dates and day groups now render in UTC first and switch to the
  viewer's after mount); images that finished loading from the cache before React attached
  `onLoad` stayed invisible, here and in the Studio (`components/studio/reveal-image.tsx`
  checks `complete` on mount); the audio row overflowed a phone (a grid item needs
  `min-w-0`). The day grouping moved to `lib/day-groups.ts` so the client can use it.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-009 (Edit on the shell)
- **Read first:** `components/library/*`, `app/(app)/library/*`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, tests pass
playwright, as the guest:
  /library at 1440: two images and the knock under "Today"
  a tile → /library/a/<id>, role=dialog over the grid; Esc → /library, no dialog
  Audio tab → /library?kind=audio
  /library/a/<id> loaded directly → the page with "← Library"
  at 390 after a cached reload: images at opacity 1, scrollWidth 390
  no page errors on the asset page or the library
```

## Outcome
Shipped: the library and the lightbox per design §6, Library in the sidebar, a reveal image
that handles cached loads (fixing the Studio too), a changelog line. Left out: arrow keys in
the lightbox and the Studio's expand opening the lightbox (both small; folded into
TICKET-015's fix list if they matter in the review). No new tickets.
