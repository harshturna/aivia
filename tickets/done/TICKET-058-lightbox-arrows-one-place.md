# TICKET-058: Lightbox arrows in one place for every kind

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The lightbox's previous and next sit at the vertical centre over images and video but at the
bottom over a sound (TICKET-053 moved them for sounds only, because centred they covered the
player at 390). The owner asked for one place (chat, 2026-10-11). They go to the bottom
corners for every kind.

## Context
- `components/library/lightbox.tsx`: the two buttons in the media pane, classed by `audio`.
- Bottom, not centre: on a phone the sound row is the pane's full width, so centred arrows
  cover its play button and length; the media pane has 16 px (40 px at lg) of padding, so at
  the bottom they sit in the margin under the media on desktop.

## Plan
- [x] Both buttons `bottom-3` for every kind; drop the `audio` switch.
- [x] Verify: screenshots of an image, a clip and a sound at 1440 and 390 with the arrows in
      the same place; `npm run verify`.

## Progress log
- 2026-10-11 — Ticket written and started.
- 2026-10-11 — At 390 the arrows still moved: the details panel's height follows each item's
  prompt, so the media pane changed height with it. On phones the dialog is now a fixed
  11:9 split (media over details, the details scrolling inside).

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** nothing.
- **Read first:** nothing

## Verification
```
node .audit/t053/arrows.mjs   # arrow top, stepping image → clip → sound in the dialog:
                              # 1440: 819, 819, 819; 390: 415, 415, 415
npm run verify                # pass
playwright: the lightbox and sound-page checks pass
```
Screenshots reviewed: `.audit/t053/arrows-{image,video,sound}-{1440,390}.png`.

## Outcome
Shipped: previous and next sit at the bottom corners of the media pane for every kind, and on
phones the media and details keep a fixed split, so the arrows do not move as you step. Left
out: nothing.
