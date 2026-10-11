"use client";

import { useEffect } from "react";

/**
 * One sound at a time, anywhere in the app (TICKET-044): when audio or a video with sound
 * starts, any other that is playing with sound pauses where it is. `play` does not bubble, so it is caught on the way
 * down. Muted ambient video is not sound and is left alone.
 */
export function OneSound() {
  useEffect(() => {
    const onPlay = (e: Event) => {
      const started = e.target;
      if (!(started instanceof HTMLMediaElement) || started.muted) return;
      for (const other of document.querySelectorAll<HTMLMediaElement>(
        "audio, video"
      ))
        if (other !== started && !other.paused && !other.muted) other.pause();
    };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);
  return null;
}
