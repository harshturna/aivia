# TICKET-052: Studio layout and controls polish

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The mode menu fits and works by keyboard, the composer fade passes clicks, chips fit the mode, guest forks and titles behave, and the run's type, spacing and media sizing match the design.

## Context
- Findings: TICKET-050, section B. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Files: `components/studio/composer.tsx`, `components/studio/params.tsx`,
  `components/studio/modes.ts`, `components/studio/run.tsx`, `components/studio/outputs.tsx`,
  `components/studio/audio-row.tsx`, `components/ai/Markdown.tsx`, `components/shell/screen.tsx`,
  `app/(app)/studio/studio-client.tsx`, `components/characters/chat.tsx` (its composer wrapper),
  `lib/session-text.ts`, `lib/guest-local.ts`, `lib/cut.ts` (+ tests), `docs/design/revamp.md`.
- Already done in TICKET-051: tall images capped, Animate on touch behind a tap.
- Moved to TICKET-054 (shell): the skip link's Tab order. Not done: a time on the brief
  (messages carry no timestamp; the tab-local send time is lost on reload).
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [x] Mode menu on the Radix dropdown (radio group, label and hint, a check on the current
      mode, collision-aware, arrow keys); the trigger is not a toggle; choosing returns focus
      to the field.
- [x] The composer's fade wrapper passes clicks (Studio and character chat).
- [x] Example chips per mode, none repeating a pinned example; on a phone they stack as rows.
- [x] A guest's fork of an example is titled from their brief; guests can rename and delete
      their own local sessions (`deleteLocalSession`).
- [x] Titles cut at a word boundary (`titleFromBrief`, + test).
- [x] Audio row: a thin progress bar below 640 px and `aria-pressed` on play.
- [x] Brief 14 px; notes inherit the run's 24 px leading (Markdown `p` drops `leading-7`).
- [x] The empty state sits at a fixed top instead of re-centring as the composer grows.
- [x] Step status icons sit right after their text.
- [x] Video gets a Download beside Reuse prompt.
- [x] Lows: a solid header with its border only once scrolled; param menus use the pill's
      words; a shorter Video hint; "Cut it together" needs two pieces (`canCut`, + test);
      image buttons named after their image; attachment thumbnails made and revoked in one
      effect; design §5.1 heading size matches the build.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright: mode menu at 1440x600 and by
      keyboard, a click through the fade, chips per mode at 1440 and 390, a guest fork's title,
      local rename and delete, a long title, phone audio progress, the empty state while typing;
      screenshots at 1440 and 390; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Also: the audio row shows elapsed time while playing (all widths);
  the empty state starts at 10dvh on phones (the desktop offset left a blank band); title
  tests joined the existing `lib/assets.test.ts` block instead of a new file.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-053.
- **Read first:** nothing

## Verification
```
npm run verify      # lint (no errors), typecheck, tickets, 79 unit tests: pass
npm run test:e2e    # 24 passed
node .audit/t052/v.mjs, e.mjs   # Playwright, guest, paid routes stubbed
  mode menu at 1440x600: on screen (307 to 590), current mode checked, arrow keys move,
    Enter picks Image and focus returns to the field; Image shows image chips
  empty state heading top 132 before and after ten lines typed
  a guest's fork of the owl example: titled "Make the owl smaller and lower in the frame,
    keep the dawn…"; renamed to "Small owl" (stored); deleted (back to /studio, store empty)
  header hairline transparent at the top, --border once scrolled (1440 and 390)
  the point 15 px above the composer hits the page, not the fade wrapper
  390 audio: progress bar scaleX 0.065 after 2 s, play aria-pressed=true, elapsed 0:02
```
Screenshots reviewed: `.audit/t052/menu-1440x600.png`, `empty-390.png`, `empty-music-390.png`,
`empty-music-1440.png`, `thread-390.png`, `thread-1440.png`. web-design-guidelines over the
changed code: no findings.

## Outcome
Shipped: a keyboard-operable mode menu that stays on screen; the composer's fade passes
clicks; per-mode example chips that never repeat a pinned example, stacked on phones; guest
forks titled from their brief, and guests can rename and delete their own sessions; titles cut
at a word; phone audio progress and elapsed time; a 14 px brief and 24 px notes; a steady empty
state; step icons beside their step; Download for clips; a solid header with a hairline once
scrolled; consistent parameter labels; a shorter Video hint; no cut offer for a lone clip;
image buttons named after their image; safer attachment thumbnails; design §5.1 updated.
Left out: a time on the brief (no timestamp is stored); the skip link moves to TICKET-054.
