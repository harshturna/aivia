"use client";

import { useEffect } from "react";

/**
 * One sound at a time, anywhere in the app (TICKET-044): when an audio element starts, any
 * other that is playing pauses where it is. `play` does not bubble, so it is caught on the way
 * down. Muted ambient video is not sound and is left alone.
 */
export function OneSound() {
  useEffect(() => {
    const onPlay = (e: Event) => {
      const started = e.target;
      if (!(started instanceof HTMLAudioElement)) return;
      for (const other of document.querySelectorAll("audio"))
        if (other !== started && !other.paused) other.pause();
    };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);
  return null;
}
