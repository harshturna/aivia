"use client";

import Image from "next/image";
import { useRef } from "react";
import { AudioRow } from "@/components/studio/audio-row";
import {
  CLIPS,
  type LandingClip,
  type LandingStill,
  STILLS,
  TRACKS,
} from "@/lib/landing-media";
import { cn } from "@/lib/utils";

/**
 * The wall (design §11): real outputs in a grid, one aspect per row, clips playing on hover,
 * the prompt that made each one revealed over a bottom gradient.
 */
type Tile = LandingClip | LandingStill;

const ROWS: Array<{ ratio: string; tiles: Tile[] }> = [
  { ratio: "16/9", tiles: [CLIPS[0], STILLS[4], CLIPS[2]] },
  { ratio: "3/4", tiles: [STILLS[0], STILLS[2], STILLS[6], STILLS[3]] },
  { ratio: "1/1", tiles: [STILLS[1], CLIPS[1], STILLS[5], STILLS[7]] },
];

function VideoTile({ clip, ratio }: { clip: LandingClip; ratio: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <figure
      className="group relative overflow-hidden rounded-media bg-surface"
      style={{ aspectRatio: ratio }}
      onMouseEnter={() => ref.current?.play().catch(() => {})}
      onMouseLeave={() => {
        ref.current?.pause();
      }}
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={clip.poster}
        className="size-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.02]"
      >
        <source src={clip.src} type="video/mp4" />
      </video>
      <Caption text={clip.prompt} meta={`clip, ${clip.seconds} s`} />
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
        sizes="(max-width: 760px) 50vw, 300px"
        className="size-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.02]"
      />
      <Caption text={still.prompt} meta={`image, ${still.seconds} s`} />
    </figure>
  );
}

function Caption({ text, meta }: { text: string; meta: string }) {
  return (
    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(10_10_11/.85),transparent)] px-3 pb-3 pt-10 text-[12px] leading-4 text-fg opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <span className="block">{text}</span>
      <span className="mt-0.5 block text-mute">{meta}</span>
    </figcaption>
  );
}

export function Wall() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 sm:px-8">
      <h2 className="max-w-[22ch] text-[clamp(32px,4vw,48px)] font-medium leading-[1.05] tracking-[-0.02em] [text-wrap:balance]">
        Every one of these started as a sentence.
      </h2>
      <p className="mt-4 max-w-[52ch] text-[16px] leading-6 text-fg-2">
        Nothing here was retouched. Each tile shows the line that made it.
      </p>
      <div className="mt-10 space-y-3">
        {ROWS.map((row) => (
          <div
            key={row.ratio}
            className={cn(
              "grid gap-3",
              row.tiles.length === 3
                ? "grid-cols-2 md:grid-cols-3"
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
        <div className="grid gap-3 md:grid-cols-2">
          {TRACKS.map((track) => (
            <AudioRow
              key={track.src}
              src={track.src}
              title={track.title}
              subtitle={track.prompt}
              seconds={track.seconds}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
