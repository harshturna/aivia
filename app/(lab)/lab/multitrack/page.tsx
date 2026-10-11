"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Direction study: Multitrack (TICKET-020). One brief laid out as an edit: a lane and a
 * colour per medium, real timecode, the clips rendering in, a playhead that plays the score.
 */
const C = {
  bg: "#0d0d0f",
  panel: "#141417",
  lane: "#19191d",
  line: "rgba(255,255,255,0.07)",
  fg: "#ededed",
  mute: "#8e8e97",
  image: "#ff6a3d",
  video: "#5b7bff",
  music: "#ffc83d",
  sound: "#2fd08a",
  words: "#e9e4da",
};
const SECONDS = 30;
const BRIEF =
  "A poster, a ten-second teaser and a soundtrack for a night market. Keep it warm, nothing neon.";

type Lane = {
  id: string;
  name: string;
  color: string;
  clips: Array<{
    start: number;
    end: number;
    label: string;
    kind: "image" | "film" | "wave" | "text";
    data?: string;
  }>;
};

const LANES: Lane[] = [
  {
    id: "image",
    name: "Picture",
    color: C.image,
    clips: [
      {
        start: 0,
        end: 7,
        label: "Poster, 3:4",
        kind: "image",
        data: "/landing/lanterns.webp",
      },
    ],
  },
  {
    id: "video",
    name: "Clip",
    color: C.video,
    clips: [
      { start: 3, end: 13, label: "Teaser, 10 s", kind: "film", data: "alley" },
    ],
  },
  {
    id: "music",
    name: "Score",
    color: C.music,
    clips: [
      {
        start: 0,
        end: 30,
        label: "Night market lo-fi",
        kind: "wave",
        data: "lofi",
      },
    ],
  },
  {
    id: "sound",
    name: "Sound",
    color: C.sound,
    clips: [
      {
        start: 5,
        end: 15,
        label: "Rain on a tin roof",
        kind: "wave",
        data: "rain",
      },
    ],
  },
  {
    id: "words",
    name: "Words",
    color: C.words,
    clips: [
      { start: 1, end: 9, label: "Lanterns on, kitchen open.", kind: "text" },
      {
        start: 11,
        end: 20,
        label: "Come hungry. Leave at midnight.",
        kind: "text",
      },
      {
        start: 22,
        end: 30,
        label: "The street is the restaurant.",
        kind: "text",
      },
    ],
  },
];

function tc(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const f = Math.floor((s % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

function usePeaks(name: string) {
  const [peaks, setPeaks] = useState<number[]>([]);
  useEffect(() => {
    fetch(`/lab/${name}-peaks.json`)
      .then((r) => r.json())
      .then(setPeaks)
      .catch(() => {});
  }, [name]);
  return peaks;
}

function Wave({ name, color }: { name: string; color: string }) {
  const peaks = usePeaks(name);
  return (
    <div className="flex h-full items-center gap-[2px] px-2">
      {peaks.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
        <i
          key={i}
          className="block flex-1 rounded-full"
          style={{
            height: `${Math.max(8, p * 80)}%`,
            background: color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function Film({ name }: { name: string }) {
  return (
    <div className="flex h-full gap-[2px] p-[3px]">
      {[0.5, 1.5, 2.5, 3.5, 4.5, 0.5, 1.5, 2.5].map((t, i) => (
        // biome-ignore lint/performance/noImgElement: tiny strip frames
        // biome-ignore lint/suspicious/noArrayIndexKey: positional frames
        <img
          key={i}
          src={`/lab/${name}-${t}.jpg`}
          alt=""
          className="h-full min-w-0 flex-1 rounded-[3px] object-cover"
        />
      ))}
    </div>
  );
}

function Timeline() {
  const [rendered, setRendered] = useState(0);
  const [head, setHead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const raf = useRef(0);

  // The clips render in, lane by lane, once.
  useEffect(() => {
    const ids = LANES.map((_, i) =>
      setTimeout(() => setRendered(i + 1), 500 + i * 650)
    );
    return () => ids.forEach(clearTimeout);
  }, []);

  // The playhead follows the score when it plays; otherwise it idles slowly across.
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playing && audio.current)
        setHead(audio.current.currentTime % SECONDS);
      else if (rendered === LANES.length)
        setHead((h) => (h + dt * 0.6) % SECONDS);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, rendered]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (playing) a.pause();
    else {
      a.currentTime = head;
      a.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const pct = (s: number) => `${(s / SECONDS) * 100}%`;

  return (
    <div
      className="overflow-hidden rounded-[14px] border"
      style={{ background: C.panel, borderColor: C.line }}
    >
      {/* transport */}
      <div
        className="flex items-center gap-4 border-b px-4 py-3"
        style={{ borderColor: C.line }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play the score"}
          className="grid size-8 place-items-center rounded-full"
          style={{ background: C.fg, color: C.bg }}
        >
          {playing ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 translate-x-px fill-current" />
          )}
        </button>
        <span
          className="font-[family-name:var(--font-dm-mono)] text-[13px] tabular-nums"
          style={{ color: C.fg }}
        >
          {tc(head)}
        </span>
        <span className="truncate text-[13px]" style={{ color: C.mute }}>
          {BRIEF}
        </span>
        <audio
          ref={audio}
          src="/landing/lofi.mp3"
          preload="none"
          onEnded={() => setPlaying(false)}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="relative min-w-[900px]">
          {/* ruler */}
          <div
            className="grid grid-cols-[132px_1fr] border-b"
            style={{ borderColor: C.line }}
          >
            <div />
            <div className="relative h-8">
              {Array.from({ length: SECONDS + 1 }, (_, s) => (
                <div
                  key={s}
                  className="absolute bottom-0 h-full"
                  style={{ left: pct(s) }}
                >
                  <div
                    className="absolute bottom-0 w-px"
                    style={{ height: s % 5 === 0 ? 12 : 5, background: C.line }}
                  />
                  {s % 5 === 0 && s < SECONDS && (
                    <span
                      className="absolute left-1.5 top-1.5 font-[family-name:var(--font-dm-mono)] text-[10.5px]"
                      style={{ color: C.mute }}
                    >
                      {tc(s).slice(0, 5)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* lanes */}
          {LANES.map((lane, li) => (
            <div
              key={lane.id}
              className="grid grid-cols-[132px_1fr] border-b last:border-b-0"
              style={{ borderColor: C.line }}
            >
              <div
                className="flex items-center gap-2.5 px-4 text-[13px] font-medium"
                style={{ color: C.fg }}
              >
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ background: lane.color }}
                />
                {lane.name}
              </div>
              <div className="relative h-[68px]" style={{ background: C.lane }}>
                {lane.clips.map((clip) => (
                  <div
                    key={clip.label}
                    className="absolute top-[6px] bottom-[6px] overflow-hidden rounded-[6px]"
                    style={{
                      left: pct(clip.start),
                      width: pct(clip.end - clip.start),
                      background: `color-mix(in oklab, ${lane.color} 16%, ${C.lane})`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${lane.color} 45%, transparent)`,
                      clipPath:
                        rendered > li ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                      transition: "clip-path 900ms cubic-bezier(.23,1,.32,1)",
                    }}
                  >
                    {clip.kind === "image" && (
                      <div className="flex h-full items-center gap-3 p-[3px]">
                        {/* biome-ignore lint/performance/noImgElement: a clip thumbnail */}
                        <img
                          src={clip.data}
                          alt=""
                          className="h-full rounded-[4px] object-cover"
                        />
                        <span
                          className="truncate text-[12px]"
                          style={{ color: C.fg }}
                        >
                          {clip.label}
                        </span>
                      </div>
                    )}
                    {clip.kind === "film" && (
                      <Film name={clip.data ?? "alley"} />
                    )}
                    {clip.kind === "wave" && (
                      <Wave name={clip.data ?? "lofi"} color={lane.color} />
                    )}
                    {clip.kind === "text" && (
                      <div
                        className="flex h-full items-center px-3 text-[13px]"
                        style={{ color: C.words }}
                      >
                        <span className="truncate">“{clip.label}”</span>
                      </div>
                    )}
                    <span
                      className="absolute left-0 top-0 h-full w-[3px]"
                      style={{ background: lane.color }}
                      aria-hidden
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* playhead */}
          <div className="pointer-events-none absolute inset-y-0 left-[132px] right-0">
            <div
              className="absolute inset-y-0 w-px"
              style={{ left: pct(head), background: C.fg }}
            >
              <span
                className="absolute -left-[5px] top-0 size-[11px] rotate-45 rounded-[2px]"
                style={{ background: C.fg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MultitrackStudy() {
  return (
    <div className="min-h-dvh" style={{ background: C.bg, color: C.fg }}>
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center gap-7 px-6 text-[13.5px]">
        <span className="text-[19px] font-semibold tracking-[-0.02em]">
          aivia
        </span>
        <span style={{ color: C.mute }}>Pricing</span>
        <span style={{ color: C.mute }}>Changelog</span>
        <span
          className="ml-auto rounded-[8px] px-3.5 py-2 font-medium"
          style={{ background: C.fg, color: C.bg }}
        >
          Start a brief
        </span>
      </nav>

      <header className="mx-auto grid max-w-[1240px] gap-8 px-6 pb-12 pt-16 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h1 className="text-[clamp(44px,7vw,104px)] font-medium leading-[0.92] tracking-[-0.04em]">
          One brief.
          <br />
          Every track.
        </h1>
        <div className="max-w-[44ch] pb-2">
          <p className="text-[17px] leading-7" style={{ color: C.mute }}>
            Write what you want. Aivia lays it out like an edit: the picture,
            the clip, the score, the sound and the words, each on its own lane,
            made while you watch.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {LANES.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12.5px]"
                style={{ borderColor: C.line }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: l.color }}
                />
                {l.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-6">
        <Timeline />
      </section>

      <section className="mx-auto max-w-[1240px] px-6 py-28">
        <h2 className="max-w-[18ch] text-[clamp(32px,4vw,56px)] font-medium leading-[1] tracking-[-0.03em]">
          Pull any track out on its own.
        </h2>
        <div className="mt-12 grid gap-3 md:grid-cols-5">
          {[
            {
              lane: LANES[0],
              body: (
                <img
                  src="/landing/lanterns.webp"
                  alt=""
                  className="aspect-[3/4] w-full rounded-[8px] object-cover"
                />
              ),
            },
            {
              lane: LANES[1],
              body: (
                <video
                  src="/landing/alley.mp4"
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="aspect-[3/4] w-full rounded-[8px] object-cover"
                />
              ),
            },
            {
              lane: LANES[2],
              body: (
                <div
                  className="aspect-[3/4] w-full rounded-[8px]"
                  style={{ background: C.lane }}
                >
                  <Wave name="lofi" color={C.music} />
                </div>
              ),
            },
            {
              lane: LANES[3],
              body: (
                <div
                  className="aspect-[3/4] w-full rounded-[8px]"
                  style={{ background: C.lane }}
                >
                  <Wave name="rain" color={C.sound} />
                </div>
              ),
            },
            {
              lane: LANES[4],
              body: (
                <div
                  className="flex aspect-[3/4] w-full flex-col justify-end gap-3 rounded-[8px] p-4 text-[17px] leading-6"
                  style={{ background: C.lane, color: C.words }}
                >
                  <p>Lanterns on, kitchen open.</p>
                  <p>Come hungry. Leave at midnight.</p>
                  <p>The street is the restaurant.</p>
                </div>
              ),
            },
          ].map(({ lane, body }) => (
            <figure key={lane.id}>
              {body}
              <figcaption className="mt-3 flex items-center gap-2 text-[13px]">
                <span
                  className="size-2 rounded-full"
                  style={{ background: lane.color }}
                />
                {lane.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
