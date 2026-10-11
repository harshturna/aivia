# TICKET-053: Library, Edit and Cut fixes

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Library search keeps typing, the lightbox fits phones and pages, Edit never double-spends or sits blank, and Cut keeps its result.

## Context
- Findings: TICKET-050, section C. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Files: `app/(app)/library/page.tsx`, `app/(app)/library/a/[id]/page.tsx`,
  `app/(app)/library/@modal/(.)a/[id]/page.tsx` (+ a `loading.tsx` beside it, a `not-found.tsx`
  for a missing asset, `app/(app)/library/loading.tsx`), `components/library/library-client.tsx`,
  `components/library/lightbox.tsx`, `components/studio/audio-row.tsx` (an action slot, an
  optional download), `components/edit/workspace.tsx`, `components/studio/cut.tsx`,
  `lib/assets.ts` (`getNeighbors`), new `lib/duration.ts` (+ test).
- Done elsewhere: lightbox Download saves a file (TICKET-051).
- Ruled out: a JS masonry for row order (CSS columns stay; the day groups already order by
  time, and a reflowing masonry is more code than the finding is worth); refunding a failed
  edit (the spend route has no refund path; a ticket if edits start failing in practice).
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [x] Library search: the client is not keyed on `q`; it takes new server results in place,
      the URL change runs in a transition and the grid dims while it is pending.
- [x] Lightbox: the mobile grid gets an explicit column (no clipping or sideways scroll at
      390); the page view is one screen tall, Esc goes back; previous and next (buttons and
      ←/→) from `getNeighbors`; a loading state for the modal route; one Download for audio
      (the row's own is hidden there); the favourite button says what it does; delete
      replaces the history entry and says when it fails; the modal keeps the "Library" title;
      a missing asset gets "Not in your library" with a link back.
- [x] Library grid: audio in one column until xl (titles no longer squeeze at 1024); the
      open-details control sits inside the audio row; durations in one m:ss format
      (`lib/duration.ts`); a grid-shaped `loading.tsx`.
- [x] Edit: the same edit cannot be applied twice (Apply shows "Applied" until something
      changes); while working, the result frame has the target's shape; media capped to the
      viewport so the controls stay in view; a result is kept per tool; the before/after
      divider has a visible handle and focus; the limit says the right thing for the user with
      a link, and Apply is disabled; the upload box accepts a dropped file; the empty result
      panel is hidden on phones until there is a photo; the hint changes once a tool is
      chosen; controls share one height; the apply button's name differs from the tool pill.
- [x] Cut: a finished cut survives closing the dialog; Cancel while cutting; the guest line
      is gone.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright (paid routes stubbed): typing
      a search with a pause, the audio lightbox at 390, the page view at 1440x900, ←/→ in
      the lightbox, Edit apply twice (one spend), working state with a slow result, the limit,
      Cut reopen; screenshots at 1440 and 390; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Also: Edit's "Restore" and "Recolor" actions read "Restore the photo"
  and "Recolor it" (`lib/edit.ts`) so the pill and the button have different names; over a
  sound row the lightbox's previous/next sit below it (they covered the play button at 390).
  The page view keeps the in-panel "Library" link rather than a screen header.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-054.
- **Read first:** nothing

## Verification
```
npm run verify      # lint (no errors), typecheck, tickets, 82 unit tests: pass
npm run test:e2e    # 24 passed
node .audit/t053/v.mjs, nav.mjs, cut.mjs, shots.mjs   # guest; Cloudinary and spend stubbed
  search: typed "wh", paused 1.2 s, typed "ale": field "whale", URL ?q=whale, focus kept
  lightbox: → then ← returns to the first asset, still a dialog, title "Library | Aivia";
    Esc closes to /library
  390 audio page: scrollWidth 390 = viewport, one Download, play button at x=25
  1440 page view: image bottom 860 of 900, page height 900; Esc → /library
  missing asset: "Not in your library"
  Edit: working frame 572x495 while waiting; after the result "Applied", disabled, 1 spend;
    Recolor and back keeps the result; at a 403 "Upgrade to Pro", Apply disabled;
    Apply bottom 743 of 900
  Cut: Cancel while cutting; no guest line; closed and reopened shows the same cut
```
Screenshots reviewed: `.audit/t053/audio-390.png`, `edit-done-1440.png`,
`library-1024-audio.png`, `library-390.png`. web-design-guidelines over the changed code: no
findings (the upload box's drop handlers are on a div by design; its buttons are the
keyboard path).

## Outcome
Shipped: library search keeps your typing and dims while it refreshes; the lightbox fits phones,
steps with ←/→ and buttons, opens at once with a loading state, keeps the tab title, offers one
Download for audio, says "In favourites", replaces history on delete and says when delete fails;
the page view is one screen and Esc goes back; a missing asset says so; audio rows hold their
open control and stay one column until xl; durations are m:ss everywhere; the library has a
grid loading state. Edit cannot pay twice for one edit, keeps a result per tool, holds the
result's shape while working, keeps its controls in view, shows a findable slider, gives the
right limit with an action, takes a dropped photo, and hides the empty panel on phones. A cut
survives closing its dialog, can be cancelled, and the guest line is gone. Left out: masonry
row order and refunds for failed edits (see Context).
