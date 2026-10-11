# TICKET-026: The brief emerges instead of typing

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
The hero's brief took about five seconds to type. Replace the typewriter with a prettier
reveal that lands the whole sentence in about two seconds: the words rise out of the fog.

## Context
- The owner (2026-10-11): "the first page take ages to write the whole thing, the solution
  isn't to just make it type fast, we just do some other effect that's more pretty".
- `app/(landing)/_landing/hero.tsx` (read): the brief is 78 character spans revealed one by
  one by a timer (`showTo`, `TOTAL`, `NOUN_END`), starting after 1.1 s, pausing 380 ms at each
  noun; windows open and underlines draw when a noun completes; the caret follows the last
  character; the scroll cue appears at the end. CSS in `app/globals.css` (`.w-ch`, `.w-caret`,
  `.w-u`, `.w-cue-wrap`, the TICKET-024 fallback).
- D-004 motion rules: transform and opacity in motion, nothing per frame through React.
- Ruled out: typing faster (the owner's words).

## Plan
- [x] The brief renders as fifteen word spans. Each rises from the fog in CSS (opacity, a third
      of an em upward, a soft blur resolving), staggered 75 ms from 0.45 s; the sentence lands
      in about 2.3 s. Pure CSS, so it runs before scripts and needs no fallback.
- [x] Each noun's underline draws in CSS as its word arrives; its window opens from a timer
      matched to the same delays; the caret fades in after the last word and blinks; the
      scroll cue follows. Scrolling early opens every window at once.
- [x] Reduced motion: words, underlines, caret and cue shown at rest, windows open.
- [x] Remove the typing code and the TICKET-024 character fallback; design doc §2.3.
- [x] Screens of the reveal at 0.6 s, 1.2 s and 3 s at 1440 and 390; with JavaScript off;
      `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — The brief is fifteen `.w-word` spans with inline delays (0.45 s + 75 ms each); `w-emerge` animates opacity, 0.32em of rise and an 8 px blur resolving over 1.1 s. Nouns carry a second animation, `w-underline`, 0.35 s behind their word. Windows open from timers matched to the same delays (`OPEN_AT`, measured from navigation start); scrolling early opens all of them. The caret fades in after the last word and blinks; the scroll cue fades in at 2.5 s. The typing code (`showTo`, `TOTAL`, `NOUN_END`) and the TICKET-024 character fallback are gone: the reveal is CSS, so it runs without a script. Design doc §2.3 updated.

## Verification
Screens of the reveal at 0.6 s, 1.2 s and 3 s after load at 1440x900 and 390x844: the first
word condensing, the wave halfway with the first windows open, the sentence landed with the
cue. With JavaScript disabled all 15 words reach full opacity. No page errors.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the brief lands in about 2.3 s instead of about 5 s, with words rising out
of the fog in place of the typewriter. No follow-ups.
