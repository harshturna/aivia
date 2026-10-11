# TICKET-027: A calmer first frame; windows pulled out of their words

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The hero's first frame is cluttered: a 124 px brief over four lines, four inline windows,
four underline colours, a caret and a pill, over a busy plate. Let the forest lead, keep the
brief plain and smaller, and move the windows to the first scroll, pulled out of their own
words, so the rest of the sequence still lands.

## Context
- The owner (2026-10-11): "this feels a bit too cluttery no? maybe we want to go to a
  different direction than this"; then, on the proposal to calm the first frame: "sure try
  whatever, the other pages will need to be redo as well as the sequence won't land".
- `app/(landing)/_landing/hero.tsx` (read): windows start in slots inside the sentence
  (`slotRefs`), the brief shrinks toward a caption anchor (`captionRef`), caret and underlines
  are CSS (`app/globals.css`, read), windows open by timers matched to the word delays.
- `app/(landing)/_landing/type.ts`, `your-turn.tsx`, `sections.tsx` (read): section headings
  run to 76 px and the close and composer headings to 104 px, louder than the new brief.
- D-004 stands; this is composition, not direction.

## Plan
- [x] First frame: the brief at `clamp(34px, 4.6vw, 72px)`, left over the dark trunks,
      centred vertically; no windows, underlines or caret; one plain line saying what Aivia
      does; a thin "Scroll" cue without a pill; fewer, fainter motes and fainter fog.
- [x] First scroll: each window starts on its noun's box, fades in as it leaves and flies to
      the triptych; the brief drifts up and fades. The triptych and timeline stay. The teaser
      starts loading on the first scroll.
- [x] Lower headings one size down (sections up to 58 px; composer and close up to 80 px).
- [x] Remove the slots, caption anchor, caret, underline and window timers; design doc §2.3
      and §11.
- [x] Screens at 1440, 1280x720 and 390 at load and through the sequence; `npm run verify`,
      `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — First frame: the brief at `clamp(34px, 4.6vw, 72px)`, 640 px wide, vertically centred on the left; under it "Write one line. Aivia plans it and makes every piece while you watch." (fades in at 1.7 s) and a thin "Scroll" cue (2.3 s); motes 30 to 18 and fainter; the mid fog from 22% to 14%. Removed: inline slots, coloured underlines, the caret, the cue pill, the caption anchor, the window timers. Windows now start on their noun's measured box with opacity rising five times faster than their move; the brief lifts 6% of the viewport, shrinks 4% and fades between 6% and 20% of the sequence. The teaser loads on the first scroll. Section headings to `clamp(34px, 4.2vw, 58px)`, the composer and close headings to `clamp(40px, 5.4vw, 80px)`. Design doc §2.2, §2.3 and §11 updated.

- 2026-10-11 — Reverted by TICKET-028: the owner found the calm frame "lost its charm and the pages that follow it are disconnected".

## Verification
Screens at 1440x900, 1280x720 and 390x844 at 0, 10%, 18%, 47% and 95% of the sequence: the
first frame shows only the forest, the brief, one line and the cue; at 18% the poster and
teaser leave their words while the brief fades; the triptych and timeline unchanged. No page
errors.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: a calm first frame where the forest leads, the windows pulled out of
their words on the first scroll, and quieter section headings. No follow-ups.
