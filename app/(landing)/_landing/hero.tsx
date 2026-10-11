"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ForestPlate } from "@/components/forest-plate";
import { cn } from "@/lib/utils";
import { SCORE_PEAKS } from "./score-peaks";

/**
 * The hero (D-004, design §11.2): one pinned sequence. The brief writes itself over an old
 * forest at first light; each noun opens a round-headed window onto what it became; on
 * scroll the windows gather into a triptych in low fog before a set of tree rings, then
 * flatten into lanes on one timeline with a playhead.
 *
 * Built for frame budget (TICKET-021): the typing, the scroll and the clock write straight
 * to the elements that change, never through React state or an inherited custom property
 * on the stage; everything that moves every frame is a transform or an opacity on its own
 * layer; ambient motion pauses off screen; the clock runs only while something shows it.
 */
type Key = "poster" | "teaser" | "score" | "words";
const KEYS: Key[] = ["poster", "teaser", "score", "words"];

const MEDIUM: Record<
  Key,
  { tint: string; label: string; meta: string; lane: string; em: number }
> = {
  poster: {
    tint: "var(--color-tint-bark)",
    label: "Poster",
    meta: "Image",
    lane: "Picture",
    em: 0.6,
  },
  teaser: {
    tint: "var(--color-tint-water)",
    label: "Teaser",
    meta: "Video",
    lane: "Clip",
    em: 1.4,
  },
  score: {
    tint: "var(--color-tint-light)",
    label: "Soundtrack",
    meta: "Music",
    lane: "Score",
    em: 2.0,
  },
  words: {
    tint: "var(--color-tint-fern)",
    label: "Words",
    meta: "Copy",
    lane: "Words",
    em: 2.3,
  },
};

type Tok = { w: string } | { n: Key; w: string };
const BRIEF: Tok[] = [
  { w: "A " },
  { n: "poster", w: "poster," },
  { w: " a " },
  { n: "teaser", w: "teaser," },
  { w: " a " },
  { n: "score", w: "soundtrack" },
  { w: " and the " },
  { n: "words", w: "words" },
  { w: " for a forest older than memory." },
];
export const BRIEF_TEXT = BRIEF.map((t) => t.w).join("");
/**
 * The brief as words, each rising out of the fog on its own delay (CSS, so it runs before
 * any script). A noun's window opens as its word arrives.
 */
const WORD_START = 0.45;
const WORD_STEP = 0.075;
const WORDS = (() => {
  const out: Array<{ text: string; noun?: Key }> = [];
  for (const t of BRIEF) {
    if ("n" in t) out.push({ text: t.w, noun: t.n });
    else for (const w of t.w.split(" ").filter(Boolean)) out.push({ text: w });
  }
  return out.map((w, i) => ({ ...w, delay: WORD_START + i * WORD_STEP }));
})();
/** When each window opens, in ms from load: a beat after its word starts rising. */
const OPEN_AT = Object.fromEntries(
  WORDS.filter((w) => w.noun).map((w) => [w.noun, (w.delay + 0.3) * 1000])
) as Record<Key, number>;

const TAGLINES: Array<{ text: string; from: number; to: number }> = [
  { text: "Older than every map.", from: 0.04, to: 0.28 },
  { text: "Walk in before the world wakes.", from: 0.36, to: 0.62 },
  { text: "The light still finds its way down.", from: 0.68, to: 0.97 },
];
const FRAMES = [0.5, 1.5, 2.5, 3.5, 4.5, 0.5, 1.5, 2.5, 3.5, 4.5];
const ROT = [-4, 2.5, -2, 3.5];
const SCORE_SECONDS = 30;
/** The fog plates are 1400x799; a tile is as wide as its height allows. */
const FOG_RATIO = 1400 / 799;

type R = { x: number; y: number; w: number; h: number };
type Geo = {
  k0: Record<Key, R>;
  k1: Record<Key, R>;
  k2: Record<Key, R>;
  tracks: R;
  s0: R;
  s1: { x: number; y: number; s: number };
  vh: number;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The timeline always runs; this only switches the soundtrack on and off. */
function SoundButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Turn the sound off" : "Turn the sound on"}
      className="grid size-8 place-items-center rounded-full border border-fg/30 bg-bg/40 text-fg transition-colors hover:bg-fg/15"
    >
      {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}

function Mark({ k }: { k: Key }) {
  return (
    <span
      className="h-2.5 w-2 shrink-0 rounded-t-full"
      style={{ background: MEDIUM[k].tint }}
    />
  );
}

function Wave() {
  return (
    <svg
      viewBox="0 0 120 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      {SCORE_PEAKS.map((p, i) => {
        const h = Math.max(8, p * 100);
        return (
          <rect
            // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
            key={i}
            x={i + 0.18}
            y={(100 - h) / 2}
            width={0.64}
            height={h}
          />
        );
      })}
    </svg>
  );
}

/**
 * What each window holds. The box is set from scroll; the parts marked `data-part` are
 * written directly each frame (no inherited custom properties: they would restyle the
 * whole window, waveform bars included, on every frame).
 */
function PieceBody({
  k,
  videoRef,
}: {
  k: Key;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  if (k === "poster")
    return (
      <Image
        src="/landing/tree.jpg"
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 360px"
        className="object-cover object-[50%_40%]"
      />
    );
  if (k === "teaser")
    return (
      <>
        <video
          ref={videoRef}
          src="/landing/canyon.mp4"
          poster="/landing/canyon-poster.webp"
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          data-part="strip"
          className="absolute inset-0 flex bg-bg opacity-0"
        >
          {FRAMES.map((f, i) => (
            // biome-ignore lint/performance/noImgElement: tiny filmstrip frames
            <img
              // biome-ignore lint/suspicious/noArrayIndexKey: the strip repeats
              key={i}
              src={`/landing/canyon-${f}.jpg`}
              alt=""
              decoding="async"
              className="aspect-video h-full shrink-0 border-r border-bg/70 object-cover"
            />
          ))}
        </div>
      </>
    );
  if (k === "score")
    return (
      <div className="absolute inset-0 bg-surface [container-type:size]">
        <div
          data-part="head"
          className="absolute inset-x-5 top-[24%] flex items-baseline justify-center gap-2.5 whitespace-nowrap opacity-0"
        >
          <span className="font-display text-[clamp(12px,8cqw,21px)] italic leading-none text-fg">
            First light in the old wood
          </span>
          <span className="text-[12px] tabular-nums text-mute max-md:hidden">
            0:30
          </span>
        </div>
        <div
          data-part="bars"
          className="absolute inset-x-1.5 bottom-[16%] top-[16%] text-sun"
        >
          <div className="absolute inset-0 fill-current opacity-30">
            <Wave />
          </div>
          <div data-part="played" className="absolute inset-0 fill-current">
            <Wave />
          </div>
        </div>
      </div>
    );
  return (
    <div className="absolute inset-0 bg-surface-2 [container-type:size]">
      <div
        data-part="chip"
        className="absolute inset-0 flex flex-col justify-center px-[clamp(6px,9cqh,22px)] text-center"
      >
        <p className="font-display text-[clamp(9px,min(26cqh,11cqw),22px)] italic leading-[1.15] text-fg">
          &ldquo;{TAGLINES[0].text}&rdquo;
        </p>
        <div
          data-part="more"
          className="max-h-0 overflow-hidden opacity-0 @max-[240px]:hidden"
        >
          <p className="mt-2 font-display text-[17px] italic leading-6 text-fg-2">
            &ldquo;{TAGLINES[1].text}&rdquo;
          </p>
        </div>
      </div>
      <div data-part="lanes" className="absolute inset-0 opacity-0">
        {TAGLINES.map((t) => (
          <div
            key={t.text}
            className="absolute inset-y-1.5 overflow-hidden rounded-[6px] bg-tint-fern/12 px-2.5"
            style={{
              left: `${t.from * 100}%`,
              width: `${(t.to - t.from) * 100}%`,
            }}
          >
            <div
              data-part="hi"
              className="absolute inset-0 bg-tint-fern/30 opacity-0"
            />
            <p className="relative truncate pt-1.5 font-display text-[16px] italic leading-5 text-fg sm:pt-2.5">
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tree rings: growth read as time, the instrument behind the triptych. */
const RINGS = (() => {
  const out: string[] = [];
  for (let r = 0; r < 15; r++) {
    const radius = 14 + r * 5.6 + (r % 3) * 0.8;
    const pts: string[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const wob =
        1 +
        0.035 * Math.sin(a * 3 + r * 0.9) +
        0.02 * Math.sin(a * 7 + r * 1.7) +
        0.012 * Math.sin(a * 13 + r);
      pts.push(
        `${(Math.cos(a) * radius * wob).toFixed(2)},${(Math.sin(a) * radius * wob * 0.97).toFixed(2)}`
      );
    }
    out.push(`M${pts.join("L")}Z`);
  }
  return out;
})();
const TICKS = Array.from({ length: 60 }, (_, i) => i * 6);

function Rings() {
  return (
    <svg viewBox="-100 -100 200 200" className="size-full" aria-hidden>
      {RINGS.map((d, i) => (
        <path
          key={d.slice(0, 24)}
          d={d}
          fill="none"
          stroke="currentColor"
          className={i % 4 === 3 ? "text-sun" : "text-fg"}
          strokeOpacity={i % 4 === 3 ? 0.26 : 0.1 + (i / RINGS.length) * 0.1}
          strokeWidth={i % 4 === 3 ? 0.3 : 0.22}
        />
      ))}
      {TICKS.map((d) => (
        <line
          key={d}
          x1="0"
          y1={d % 30 ? -96 : -93}
          x2="0"
          y2="-98"
          stroke="currentColor"
          className="text-fg"
          strokeOpacity={d % 30 ? 0.16 : 0.34}
          strokeWidth=".22"
          transform={`rotate(${d})`}
        />
      ))}
    </svg>
  );
}

/** Motes of light rising through the shafts; seeded so server and client agree. */
const MOTES = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 18 }, () => ({
    left: 30 + rnd() * 62,
    size: 6 + rnd() * 8,
    dur: 14 + rnd() * 16,
    delay: -rnd() * 30,
    sway: 10 + rnd() * 30,
    alpha: 0.3 + rnd() * 0.4,
  }));
})();

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sentenceRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const k1Ref = useRef<HTMLDivElement>(null);
  const k2Ref = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const motesRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pieceRefs = useRef<Partial<Record<Key, HTMLDivElement | null>>>({});
  const slotRefs = useRef<Partial<Record<Key, HTMLSpanElement | null>>>({});
  const geo = useRef<Geo | null>(null);
  const parts = useRef<{
    strip?: HTMLElement;
    head?: HTMLElement;
    bars?: HTMLElement;
    played?: HTMLElement;
    chip?: HTMLElement;
    more?: HTMLElement;
    lanes?: HTMLElement;
    hi: HTMLElement[];
    line?: HTMLElement;
  }>({ hi: [] });
  const state = useRef({
    p: -1,
    opened: new Set<Key>(),
    inView: true,
    teaserOpen: false,
    raf: 0,
    /** The one timeline clock: seconds at `ref` (a performance.now() time). */
    base: 0,
    ref: 0,
    seekTo: null as number | null,
    timeline: false,
  });
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  // --- the clock: only while the soundtrack plays or the timeline is on screen ---
  const writePlay = useCallback((v: number) => {
    const pt = parts.current;
    if (pt.played)
      pt.played.style.clipPath = `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`;
    if (pt.line) pt.line.style.left = `${(v * 100).toFixed(2)}%`;
    TAGLINES.forEach((t, i) => {
      const el = pt.hi[i];
      if (el) el.style.opacity = v >= t.from && v <= t.to ? "1" : "0";
    });
    if (tcRef.current)
      tcRef.current.textContent = `${fmt(v * SCORE_SECONDS)} / 0:30`;
  }, []);
  /** Where the timeline is now: the music's time while it plays, the silent clock otherwise. */
  const clockNow = useCallback(() => {
    const st = state.current;
    const audio = audioRef.current;
    if (audio && !audio.paused && st.seekTo === null)
      return audio.currentTime % SCORE_SECONDS;
    if (audio && !audio.paused) return st.seekTo ?? st.base;
    if (!st.raf) return st.base;
    return (st.base + (performance.now() - st.ref) / 1000) % SCORE_SECONDS;
  }, []);
  const tick = useCallback(() => {
    const st = state.current;
    writePlay(clockNow() / SCORE_SECONDS);
    st.raf = requestAnimationFrame(tick);
  }, [writePlay, clockNow]);
  const syncClock = useCallback(() => {
    const st = state.current;
    const audio = audioRef.current;
    const want =
      st.inView &&
      !document.hidden &&
      ((audio ? !audio.paused : false) || st.timeline);
    if (want && !st.raf) {
      // pick up where the clock rested, never from zero
      st.ref = performance.now();
      st.raf = requestAnimationFrame(tick);
    } else if (!want && st.raf) {
      st.base = clockNow();
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      writePlay(1);
    }
  }, [tick, writePlay, clockNow]);

  // --- the teaser plays only once its window is open and the hero is on screen ---
  const syncVideo = useCallback(() => {
    const v = videoRef.current;
    const st = state.current;
    if (!v || !st.teaserOpen) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (st.inView && !document.hidden && !still) v.play().catch(() => {});
    else v.pause();
  }, []);

  // --- a noun's window opens ---
  const open = useCallback(
    (k: Key) => {
      const st = state.current;
      if (st.opened.has(k)) return;
      st.opened.add(k);
      pieceRefs.current[k]?.setAttribute("data-on", "true");
      if (k === "teaser") {
        st.teaserOpen = true;
        if (videoRef.current) videoRef.current.preload = "auto";
        syncVideo();
      }
    },
    [syncVideo]
  );

  // --- one frame of the sequence for a scroll position ---
  const apply = useCallback(
    (p: number) => {
      const g = geo.current;
      if (!g) return;
      const T1 = ease(span(p, 0.06, 0.4));
      const T2 = ease(span(p, 0.56, 0.88));
      const st = ease(span(p, 0.04, 0.32));
      const L1 = span(p, 0.3, 0.4) * (1 - span(p, 0.54, 0.62));
      const L2 = span(p, 0.72, 0.86);

      for (const [el, o] of [
        [k1Ref.current, L1],
        [k2Ref.current, L2],
      ] as const) {
        if (!el) continue;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.01 ? "visible" : "hidden";
      }
      if (skyRef.current)
        skyRef.current.style.transform = `translate3d(0,${(T1 * 5 + T2 * 4).toFixed(2)}%,0) scale(${(1 + T1 * 0.06).toFixed(4)})`;
      if (veilRef.current)
        veilRef.current.style.opacity = (T1 * 0.5 + T2 * 0.3).toFixed(3);
      if (fogRef.current) {
        const y = T2 > 0 ? lerp(0.17, 0.6, T2) : lerp(0.22, 0.17, T1);
        fogRef.current.style.transform = `translate3d(0,${(y * g.vh).toFixed(1)}px,0)`;
      }
      if (mistRef.current)
        mistRef.current.style.transform = `translate3d(0,${(-p * 0.25 * g.vh).toFixed(1)}px,0)`;
      if (ringRef.current) {
        ringRef.current.style.opacity = (L1 * 0.9 + L2 * 0.25).toFixed(3);
        ringRef.current.style.transform = `translate(-50%,-50%) rotate(${(p * 70).toFixed(2)}deg) scale(${(0.9 + T1 * 0.1 + T2 * 0.25).toFixed(3)})`;
      }
      if (motesRef.current)
        motesRef.current.style.opacity = (1 - T2).toFixed(3);
      for (const k of KEYS) {
        const slot = slotRefs.current[k];
        if (slot) slot.style.opacity = (T1 * 0.28).toFixed(3);
      }
      const ph = playheadRef.current;
      if (ph) ph.style.opacity = L2.toFixed(3);

      const sentence = sentenceRef.current;
      if (sentence) {
        const dx = (g.s1.x - g.s0.x) * st;
        const dy = (g.s1.y - g.s0.y) * st;
        sentence.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${lerp(1, g.s1.s, st).toFixed(4)})`;
        // the brief is swept into its windows: it shrinks and is gone before they land
        sentence.style.opacity = (1 - span(p, 0.08, 0.24)).toFixed(3);
      }

      KEYS.forEach((k, i) => {
        const el = pieceRefs.current[k];
        if (!el) return;
        const a = ease(span(p, 0.06 + i * 0.035, 0.3 + i * 0.035));
        const b = ease(span(p, 0.56 + i * 0.03, 0.8 + i * 0.03));
        const from = b > 0 ? g.k1[k] : g.k0[k];
        const to = b > 0 ? g.k2[k] : g.k1[k];
        const t = b > 0 ? b : a;
        const x = lerp(from.x, to.x, t);
        const y = lerp(from.y, to.y, t);
        const w = lerp(from.w, to.w, t);
        const h = lerp(from.h, to.h, t);
        const rot = Math.sin(Math.PI * t) * ROT[i];
        // an arch until the timeline: round-headed windows flatten into lanes
        const arch = 1 - b;
        const rx = lerp(7, w / 2, arch);
        const ry = lerp(7, w > h ? Math.min(h * 0.3, w / 2) : w / 2, arch);
        const rb = lerp(Math.max(2, h * 0.04), 7, b);
        el.style.width = `${w.toFixed(1)}px`;
        el.style.height = `${h.toFixed(1)}px`;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
        el.style.borderRadius = `${rx.toFixed(1)}px ${rx.toFixed(1)}px ${rb.toFixed(1)}px ${rb.toFixed(1)}px / ${ry.toFixed(1)}px ${ry.toFixed(1)}px ${rb.toFixed(1)}px ${rb.toFixed(1)}px`;
        const pt = parts.current;
        if (k === "teaser" && pt.strip) pt.strip.style.opacity = b.toFixed(3);
        if (k === "score") {
          const m = a - b;
          if (pt.head) pt.head.style.opacity = m.toFixed(3);
          if (pt.bars) {
            pt.bars.style.top = `${(16 + m * 32).toFixed(2)}%`;
            pt.bars.style.left =
              pt.bars.style.right = `${(6 + m * 10).toFixed(1)}px`;
          }
        }
        if (k === "words") {
          if (pt.chip) {
            pt.chip.style.opacity = (1 - b).toFixed(3);
            pt.chip.style.paddingTop = `${(a * 14).toFixed(2)}%`;
          }
          if (pt.more) {
            pt.more.style.maxHeight = `${(a * 40).toFixed(1)}px`;
            pt.more.style.opacity = a.toFixed(3);
          }
          if (pt.lanes) pt.lanes.style.opacity = b.toFixed(3);
        }
      });

      const timeline = L2 > 0;
      if (timeline !== state.current.timeline) {
        state.current.timeline = timeline;
        syncClock();
      }
    },
    [syncClock]
  );

  const measure = useCallback(() => {
    const pt = parts.current;
    const q = (k: Key, name: string) =>
      pieceRefs.current[k]?.querySelector<HTMLElement>(
        `[data-part="${name}"]`
      ) ?? undefined;
    pt.strip = q("teaser", "strip");
    pt.head = q("score", "head");
    pt.bars = q("score", "bars");
    pt.played = q("score", "played");
    pt.chip = q("words", "chip");
    pt.more = q("words", "more");
    pt.lanes = q("words", "lanes");
    pt.hi = [
      ...(pieceRefs.current.words?.querySelectorAll<HTMLElement>(
        '[data-part="hi"]'
      ) ?? []),
    ];
    pt.line =
      playheadRef.current?.querySelector<HTMLElement>("[data-part=line]") ??
      undefined;
    const stage = stageRef.current;
    const sentence = sentenceRef.current;
    const caption = captionRef.current;
    const k1 = k1Ref.current;
    const k2 = k2Ref.current;
    if (!stage || !sentence || !caption || !k1 || !k2) return;
    const prev = sentence.style.transform;
    sentence.style.transform = "none";
    const base = stage.getBoundingClientRect();
    const rel = (el: Element | null | undefined): R => {
      const r = el?.getBoundingClientRect();
      return r
        ? {
            x: r.left - base.left,
            y: r.top - base.top,
            w: r.width,
            h: r.height,
          }
        : { x: 0, y: 0, w: 0, h: 0 };
    };
    const pick = (root: HTMLElement) =>
      Object.fromEntries(
        KEYS.map((k) => [k, rel(root.querySelector(`[data-k="${k}"]`))])
      ) as Record<Key, R>;
    const s0 = rel(sentence);
    const cap = rel(caption);
    const ruler = rel(k2.querySelector("[data-ruler]"));
    const lanes = [...k2.querySelectorAll("[data-lane]")].map(rel);
    const last = lanes[lanes.length - 1] ?? ruler;
    geo.current = {
      k0: Object.fromEntries(
        KEYS.map((k) => [k, rel(slotRefs.current[k])])
      ) as Record<Key, R>,
      k1: pick(k1),
      k2: pick(k2),
      tracks: {
        x: ruler.x,
        y: ruler.y,
        w: ruler.w,
        h: last.y + last.h - ruler.y,
      },
      s0,
      s1: { x: cap.x, y: cap.y, s: cap.w / s0.w },
      vh: base.height,
    };
    sentence.style.transform = prev;
    const ph = playheadRef.current;
    const t = geo.current.tracks;
    if (ph)
      Object.assign(ph.style, {
        left: `${t.x}px`,
        top: `${t.y}px`,
        width: `${t.w}px`,
        height: `${t.h}px`,
      });
    for (const el of [fogRef.current, mistRef.current])
      el?.style.setProperty(
        "--tile",
        `${(el.offsetHeight * FOG_RATIO).toFixed(1)}px`
      );
    const p = state.current.p;
    state.current.p = -1;
    apply(Math.max(0, p));
    state.current.p = Math.max(0, p);
  }, [apply]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // the windows open as their words arrive (the words themselves are CSS, timed from load)
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      for (const k of KEYS) open(k);
      return;
    }
    const since = performance.now();
    const ids = KEYS.map((k) =>
      setTimeout(() => open(k), Math.max(0, OPEN_AT[k] - since))
    );
    return () => {
      for (const id of ids) clearTimeout(id);
    };
  }, [reduced, open]);

  // geometry, scroll (one read and the writes per frame), visibility
  useEffect(() => {
    if (reduced === null) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    let queued = 0;
    const frame = () => {
      queued = 0;
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = reduced ? 0.47 : total > 0 ? clamp01(-r.top / total) : 0;
      if (p > 0.01 && state.current.opened.size < KEYS.length)
        for (const k of KEYS) open(k);
      if (p !== state.current.p) {
        state.current.p = p;
        apply(p);
      }
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(frame);
    };
    const still = () => {
      const s = state.current;
      stage.classList.toggle("is-still", !s.inView || document.hidden);
      syncVideo();
      syncClock();
    };
    measure();
    frame();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    const io = new IntersectionObserver(([e]) => {
      state.current.inView = e.isIntersecting;
      still();
    });
    io.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", still);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", still);
      cancelAnimationFrame(queued);
      cancelAnimationFrame(state.current.raf);
      state.current.raf = 0;
    };
  }, [reduced, apply, measure, open, syncClock, syncVideo]);

  // the sound joins the timeline where it is, and leaves it there
  const toggle = () => {
    const a = audioRef.current;
    const st = state.current;
    if (!a) return;
    if (a.paused) {
      const t = clockNow();
      st.base = t;
      st.ref = performance.now();
      st.seekTo = t;
      try {
        a.currentTime = t;
      } catch {}
      a.play().catch(() => {
        st.seekTo = null;
      });
    } else {
      st.base = a.currentTime % SCORE_SECONDS;
      st.ref = performance.now();
      st.seekTo = null;
      a.pause();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={
        reduced ? "relative h-svh min-h-[640px]" : "relative h-[380svh]"
      }
    >
      <div
        ref={stageRef}
        className="w-stage sticky top-0 h-svh min-h-[640px] overflow-hidden bg-bg"
      >
        {/* the forest */}
        <div
          ref={skyRef}
          aria-hidden
          className="absolute inset-0 origin-[45%_85%] will-change-transform"
        >
          <div className="w-arrive absolute inset-0">
            <ForestPlate />
          </div>
          <div className="w-shafts absolute inset-0 will-change-[opacity,transform]" />
          <div className="w-dawn pointer-events-none absolute inset-0 bg-bg" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-bg/65 via-bg/40 via-48% to-transparent to-80%"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg/55 to-transparent to-30%"
        />
        <div
          ref={motesRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden will-change-[opacity]"
        >
          {MOTES.map((m) => (
            <span
              key={`${m.left}-${m.delay}`}
              className="w-mote absolute bottom-[-4%] rounded-full"
              style={
                {
                  left: `${m.left}%`,
                  width: m.size,
                  height: m.size,
                  opacity: m.alpha,
                  animationDuration: `${m.dur}s`,
                  animationDelay: `${m.delay}s`,
                  "--sway": `${m.sway}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div
          ref={mistRef}
          aria-hidden
          className="w-fog-in pointer-events-none absolute inset-x-0 top-[50%] h-[44%] overflow-hidden opacity-[.14] will-change-transform"
        >
          <div className="w-drift w-drift-slow absolute inset-y-0 left-0 bg-[url(/landing/fog-mist.webp)] bg-[length:auto_100%] bg-repeat-x" />
        </div>
        <div
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-bg opacity-0 will-change-[opacity]"
        />
        <div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[57%] z-[6] aspect-square w-[min(118vh,150vw)] opacity-0 will-change-[opacity,transform]"
        >
          <Rings />
        </div>

        {/* the brief, written over the trunks */}
        <div className="absolute inset-x-0 top-0 z-10 px-5 pt-[16svh] sm:px-8 sm:pt-[17svh]">
          <div className="mx-auto w-full max-w-[1240px]">
            <h1
              ref={sentenceRef}
              aria-label={BRIEF_TEXT}
              className="max-w-[1000px] origin-top-left font-display text-[clamp(40px,6.2vw,100px)] leading-[0.98] tracking-[-0.015em] w-lift text-fg will-change-transform"
            >
              {WORDS.map((w, i) => {
                const gap = i > 0 ? " " : null;
                const style = {
                  animationDelay: `${w.delay}s`,
                } as React.CSSProperties;
                if (!w.noun)
                  return (
                    <Fragment key={w.text + w.delay}>
                      {gap}
                      <span aria-hidden className="w-word" style={style}>
                        {w.text}
                      </span>
                    </Fragment>
                  );
                const k = w.noun;
                return (
                  <Fragment key={k}>
                    {gap}
                    <span className="whitespace-nowrap">
                      <span
                        ref={(el) => {
                          slotRefs.current[k] = el;
                        }}
                        aria-hidden
                        className="mx-[0.08em] inline-block h-[0.72em] rounded-t-full align-[-0.04em] opacity-0 will-change-[opacity]"
                        style={{
                          width: `${MEDIUM[k].em}em`,
                          background: MEDIUM[k].tint,
                        }}
                      />
                      <span aria-hidden className="w-word" style={style}>
                        {w.text}
                      </span>
                    </span>
                  </Fragment>
                );
              })}
            </h1>
          </div>
        </div>

        {/* the triptych */}
        <div
          ref={k1Ref}
          className="invisible absolute inset-0 z-10 opacity-0 will-change-[opacity]"
        >
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 pb-6 pt-[72px] sm:px-8 sm:pt-[84px] md:pb-10">
            {/* where the brief shrinks toward as it fades; nothing is drawn here */}
            <div
              ref={captionRef}
              aria-hidden
              className="h-px w-[54%] sm:w-[460px]"
            />
            <div className="w-grid my-auto">
              {KEYS.map((k) => (
                <div
                  key={k}
                  className="flex min-h-0 flex-col"
                  style={{ gridArea: k }}
                >
                  <div className="mb-2 flex h-7 items-center gap-2 text-[13px]">
                    <Mark k={k} />
                    <span className="text-fg">{MEDIUM[k].label}</span>
                    <span className="text-fg/55">{MEDIUM[k].meta}</span>
                    {k === "score" && (
                      <span className="ml-auto">
                        <SoundButton on={playing} onToggle={toggle} />
                      </span>
                    )}
                  </div>
                  <div
                    data-k={k}
                    className={
                      k === "teaser"
                        ? "aspect-video md:aspect-auto md:min-h-0 md:flex-1"
                        : "min-h-0 flex-1"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* one timeline */}
        <div
          ref={k2Ref}
          className="invisible absolute inset-0 z-10 opacity-0 will-change-[opacity]"
        >
          <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 pb-10 pt-20 sm:px-8 sm:pt-24">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="font-display text-[19px] italic text-fg sm:text-[22px]">
                Cut together on one timeline.
              </p>
              <div className="flex items-center gap-3">
                <span
                  ref={tcRef}
                  className="whitespace-nowrap text-[12.5px] tabular-nums text-fg/60"
                >
                  0:00 / 0:30
                </span>
                <SoundButton on={playing} onToggle={toggle} />
              </div>
            </div>
            <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 sm:grid-cols-[96px_1fr]">
              <span />
              <div data-ruler className="relative h-6 border-b border-fg/20">
                {[0, 5, 10, 15, 20, 25, 30].map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "absolute bottom-0 h-2 w-px bg-fg/35",
                      s % 10 && "max-sm:hidden"
                    )}
                    style={{ left: `${(s / 30) * 100}%` }}
                  >
                    <span
                      className={cn(
                        "absolute bottom-2.5 text-[11px] tabular-nums text-fg/45",
                        s === 30
                          ? "-translate-x-full"
                          : s !== 0 && "-translate-x-1/2"
                      )}
                    >
                      {fmt(s)}
                    </span>
                  </span>
                ))}
              </div>
              {(
                [
                  ["teaser", "h-[64px] sm:h-[104px]", "inset-0"],
                  [
                    "poster",
                    "h-[48px] sm:h-[72px]",
                    "inset-y-0 left-[68%] right-0",
                  ],
                  ["score", "h-[48px] sm:h-[72px]", "inset-0"],
                  ["words", "h-[40px] sm:h-[50px]", "inset-0"],
                ] as const
              ).map(([k, h, pos]) => (
                <div key={k} className="contents">
                  <div className="flex items-center gap-2 text-[12.5px] text-fg/80">
                    <Mark k={k} />
                    {MEDIUM[k].lane}
                  </div>
                  <div
                    data-lane={k}
                    className={cn("relative rounded-[7px] bg-bg/60", h)}
                  >
                    <div data-k={k} className={cn("absolute", pos)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the four made things */}
        {KEYS.map((k) => (
          <div
            key={k}
            ref={(el) => {
              pieceRefs.current[k] = el;
            }}
            aria-hidden
            data-on="false"
            className="w-piece pointer-events-none absolute left-0 top-0 z-20 h-16 w-16 overflow-hidden shadow-[0_30px_80px_-24px_rgb(0_0_0/.7)] outline outline-1 -outline-offset-1 outline-fg/20 [contain:strict] will-change-transform"
          >
            <PieceBody k={k} videoRef={videoRef} />
          </div>
        ))}

        {/* the near fog gathers under the set, then sinks away */}
        <div
          ref={fogRef}
          aria-hidden
          className="w-fog-in pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[32%] overflow-hidden opacity-75 will-change-transform md:h-[46%]"
          // its resting place at the top of the sequence, before the script takes over
          style={{ transform: "translate3d(0, 22svh, 0)" }}
        >
          <div className="w-drift absolute inset-y-0 left-0 bg-[url(/landing/fog-near.webp)] bg-[length:auto_100%] bg-repeat-x" />
        </div>

        {/* the playhead rides over every lane */}
        <div
          ref={playheadRef}
          aria-hidden
          className="pointer-events-none absolute z-30 opacity-0"
        >
          <div
            data-part="line"
            className="absolute inset-y-0 left-full w-px bg-fg"
          >
            <span className="absolute -left-[4px] -top-1 h-3 w-[9px] rounded-t-full bg-sun" />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[26] h-40 bg-linear-to-t from-bg to-transparent"
        />
      </div>
      <audio
        ref={audioRef}
        src="/landing/score.mp3"
        preload="none"
        loop
        onLoadedMetadata={(e) => {
          const t = state.current.seekTo;
          if (t !== null) e.currentTarget.currentTime = t;
        }}
        onPlaying={() => {
          // the music is really running now; from here the clock reads it
          state.current.seekTo = null;
        }}
        onPlay={() => {
          setPlaying(true);
          syncClock();
        }}
        onPause={() => {
          setPlaying(false);
          syncClock();
        }}
      />
    </section>
  );
}
