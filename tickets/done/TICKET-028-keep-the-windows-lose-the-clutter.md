# TICKET-028: Keep the windows in the sentence, lose the clutter

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
TICKET-027's calm first frame lost the hero's charm and cut the thread to the states that
follow. Bring back the windows inside the sentence and remove only what crowded it.

## Context
- The owner (2026-10-11), on TICKET-027: "ehh no, now it lost its charm and the pages that
  follow it are disconnected now".
- The charm and the connection are the windows living inside the brief (they become the
  triptych). The clutter in the owner's earlier screenshot was the 124 px type, four
  underline colours, the caret and the cue pill over a busy plate.
- This reverts commit `cd4b074` (TICKET-027) and reapplies from it only: fewer, fainter
  motes, fainter mid fog, and the smaller section headings.
- Files: `app/(landing)/_landing/hero.tsx`, `app/globals.css`, `app/(landing)/_landing/{type.ts,your-turn.tsx,sections.tsx}`,
  `docs/design/revamp.md` (all read).

## Plan
- [x] Revert TICKET-027 (its ticket record stays in `done/` with a note).
- [x] Brief one size down, `clamp(40px, 6.2vw, 100px)`; no underlines, no caret; the cue
      without its pill.
- [x] Reapply: 18 fainter motes, mid fog at 14%, section headings to 58 px, composer and close
      headings to 80 px.
- [x] Design doc §2.3 and §11; screens at 1440, 1280x720 and 390 through the sequence;
      `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — Reverted `cd4b074` (TICKET-027's record kept in `done/` with a note). On top: the brief at `clamp(40px, 6.2vw, 100px)` and 1000 px wide so it stays over the darker trunks; the noun underlines, the caret and the cue pill removed (with their CSS and keyframes); 18 fainter motes; the mid fog at 14%; section headings to 58 px, composer and close headings to 80 px. The windows open inside the sentence as their words arrive and leave from there to the triptych, as in TICKET-026. Design doc §2.2 and §2.3 updated.

## Verification
Screens at 1440x900, 1280x720 and 390x844 at 0, 18%, 47% and 95% of the sequence: the
windows inline in a four-line brief with nothing else beside the cue; the windows leaving
their slots for the triptych; the timeline unchanged. No page errors.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the windows back inside the brief, the clutter around them gone, and the
quieter background and headings kept from TICKET-027. No follow-ups.
