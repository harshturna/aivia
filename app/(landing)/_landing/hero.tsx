"use client";

import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Composer, type ComposerMode } from "@/components/studio/composer";
import { CLIPS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "A poster, a ten-second teaser and a soundtrack for a night market",
  "Album art for a quiet piano record, and a name for it",
  "The sound of rain on a tin roof, twenty seconds",
];

const HOLD_MS = 9000;
const FADE_MS = 1200;

/**
 * The hero (design §11): a generated clip full-bleed behind a two-line headline and the
 * real composer. Three clips crossfade; the headline and the composer settle in once.
 */
export function Hero() {
  const router = useRouter();
  const [mode, setMode] = useState<ComposerMode>("auto");
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setPlaying(false);
  }, []);

  // Rotate the clips. Only the current one plays; the next is cued a second before the fade.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % CLIPS.length),
      HOLD_MS
    );
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === index && playing) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (i !== index) {
        // let the fade finish before the old clip stops
        setTimeout(() => video.pause(), FADE_MS);
      } else {
        video.pause();
      }
    });
  }, [index, playing]);

  // Pause when the tab is hidden; the loops cost nothing then.
  useEffect(() => {
    const onVisibility = () => {
      const video = videos.current[index];
      if (!video) return;
      if (document.hidden) video.pause();
      else if (playing) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [index, playing]);

  const start = (prompt: string, m: ComposerMode) => {
    window.lynq?.track("Hero prompt");
    const params = new URLSearchParams({ prompt, mode: m });
    router.push(`/get-started?${params.toString()}`);
  };

  return (
    <section className="relative isolate flex min-h-[640px] flex-col justify-center overflow-hidden h-svh">
      {/* the clips */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg">
        {CLIPS.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              videos.current[i] = el;
            }}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            poster={clip.poster}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            {!reduced && <source src={clip.src} type="video/mp4" />}
          </video>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(10_10_11/.35)_0%,rgb(10_10_11/.55)_45%,rgb(10_10_11/.92)_100%)]" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-16 sm:px-8">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="hero-settle text-[clamp(40px,6.5vw,92px)] font-medium leading-[0.98] tracking-[-0.03em] text-fg [text-wrap:balance]">
            Describe it.
            <br />
            Watch it get made.
          </h1>
          <p
            className="hero-settle mx-auto mt-6 max-w-[46ch] text-[17px] leading-7 text-fg-2"
            style={{ animationDelay: "120ms" }}
          >
            One line becomes images, video, music and sound. Aivia plans the
            work and makes it while you watch.
          </p>
          <div
            className="hero-settle mx-auto mt-9 max-w-[720px] text-left"
            style={{ animationDelay: "240ms" }}
          >
            <Composer
              mode={mode}
              onModeChange={setMode}
              value={text}
              onChange={setText}
              onSubmit={start}
            />
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => setText(example)}
                    className="rounded-full border border-border bg-bg/40 px-3 py-1.5 text-[12.5px] leading-[18px] text-fg-2 backdrop-blur transition-colors duration-150 hover:border-border-strong hover:text-fg"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-[1200px] items-end justify-between px-6 pb-6 text-[12px] text-mute sm:px-8">
          <p className="max-w-[60ch]">
            Made in Aivia from &ldquo;{CLIPS[index].prompt}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={
              playing ? "Pause the background" : "Play the background"
            }
            className="grid size-9 place-items-center rounded-full border border-border bg-bg/40 text-fg-2 backdrop-blur transition-colors hover:text-fg"
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
