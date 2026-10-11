# TICKET-030: One timeline clock; the soundtrack control is a speaker

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
On the hero's timeline the playhead jumps to the start when the sound is turned on and jumps
again when it is turned off. Make one continuous clock that the sound follows, and make the
control a speaker, since the timeline always plays and the button only switches the music.

## Context
- The owner (2026-10-11): "when I play the audio it resets from the start and when I turn off
  the sound it jumps around, also I think it should be a speaker icon there no? like the
  scroll is always happening it's not pausing it controls the music".
- `app/(landing)/_landing/hero.tsx` (read): `tick` reads `audio.currentTime` while the audio
  plays and `(now - clockT0)` otherwise; `syncClock` resets `clockT0` every time the clock
  starts; `toggle` plays the audio from wherever it was (0 the first time). Two clocks, so
  every switch jumps. `PlayButton` shows play and pause icons in the triptych and the timeline.

## Plan
- [x] One clock: a resting time and a reference. Silent time is resting time plus elapsed;
      while the music plays the clock reads the music. Sound on seeks the music to the
      current time (also after the file's metadata arrives); sound off rebases the silent
      clock on where the music stopped; stopping the clock (off screen) keeps its place.
- [x] `SoundButton` with speaker icons, "Turn the sound on/off", `aria-pressed`.
- [x] Check in a browser: the timecode before and after sound on and off is continuous;
      `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `clockNow()` is the one source of time: the music's `currentTime` while it plays (after `playing` fires), otherwise `base` plus the time since `ref`. Starting the clock keeps `base`; stopping it saves `clockNow()` into `base`. Sound on sets `base`, `ref` and `seekTo` to the current time and seeks the audio there (again on `loadedmetadata`, since the file loads lazily); sound off rebases `base` on the music's time. `PlayButton` became `SoundButton` (speaker on and off icons, `aria-pressed`, "Turn the sound on/off") in the triptych and the timeline.

## Verification
Playwright on the timeline at 1440x900, sampling the playhead every frame: silent 0:02, sound
on 0:05, sound off 0:07; 311 samples, no backward jump, largest step 0.16% of the track.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: the timeline runs on one clock that the soundtrack joins and leaves
without a jump, and the control is a speaker. No follow-ups.
