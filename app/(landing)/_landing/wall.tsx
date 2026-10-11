"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  CLIPS,
  type LandingClip,
  type LandingStill,
  STILLS,
} from "@/lib/landing-media";
import { cn } from "@/lib/utils";
import { H2, LEDE, WRAP } from "./type";

/**
 * The wall (design §11.3): real outputs, one aspect per row, each with the line that made
 * it. Clips play only while they are on screen; the line shows on hover, and always on a
 * touch screen.
 */
type Tile = LandingClip | LandingStill;

const ROWS: Array<{ ratio: string; tiles: Tile[] }> = [
  { ratio: "16/9", tiles: [CLIPS[0], STILLS[9]] },
  { ratio: "3/4", tiles: [STILLS[1], STILLS[0], STILLS[3], STILLS[4]] },
  { ratio: "1/1", tiles: [STILLS[5], STILLS[6], STILLS[7], STILLS[8]] },
];

function VideoTile({ clip, ratio }: { clip: LandingClip; ratio: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return (
    <figure
      className="group relative overflow-hidden rounded-media bg-surface"
      style={{ aspectRatio: ratio }}
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={clip.poster}
        aria-label={clip.prompt}
        className="size-full object-cover"
      >
        <source src={clip.src} type="video/mp4" />
      </video>
      <Caption text={clip.prompt} />
    </figure>
  );
}

function ImageTile({ still, ratio }: { still: LandingStill; ratio: string }) {
  return (
    <figure
      className="group relative overflow-hidden rounded-media bg-surface"
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={still.src}
        alt={still.prompt}
        width={still.width}
        height={still.height}
        sizes="(max-width: 768px) 50vw, 300px"
        className="size-full object-cover"
      />
      <Caption text={still.prompt} />
    </figure>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/85 to-transparent px-3.5 pb-3 pt-12 font-display text-[16px] italic leading-5 text-fg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
      &ldquo;{text}&rdquo;
    </figcaption>
  );
}

export function Wall() {
  return (
    <section className={WRAP}>
      <h2 className={H2}>Every one of these was a sentence first.</h2>
      <p className={LEDE}>
        Nothing retouched, nothing stitched together afterwards. Each one shows
        the line that made it.
      </p>
      <div className="mt-12 space-y-3">
        {ROWS.map((row) => (
          <div
            key={row.ratio}
            className={cn(
              "grid gap-3",
              row.tiles.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 md:grid-cols-4"
            )}
          >
            {row.tiles.map((tile) =>
              tile.kind === "video" ? (
                <VideoTile key={tile.src} clip={tile} ratio={row.ratio} />
              ) : (
                <ImageTile key={tile.src} still={tile} ratio={row.ratio} />
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
