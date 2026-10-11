"use client";

import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LandingNav } from "@/app/(landing)/_landing/nav";
import {
  Changelog,
  Close,
  LandingFooter,
  LibraryPanel,
  Modes,
  Pricing,
} from "@/app/(landing)/_landing/sections";
import { StudioDemo } from "@/app/(landing)/_landing/studio-demo";
import { Wall } from "@/app/(landing)/_landing/wall";
import { Composer, type ComposerMode } from "@/components/studio/composer";

/**
 * Direction study: Unfold (TICKET-020). D-003's dark page with one signature sequence. The
 * brief types itself; each noun opens a window onto the thing it became; on scroll those
 * windows fly out into the finished set, then fall into lanes on one timeline. The same four
 * elements move the whole way, so nothing cuts.
 */
type Key = "poster" | "teaser" | "score" | "words";
const KEYS: Key[] = ["poster", "teaser", "score", "words"];

const MEDIUM: Record<
  Key,
  { color: string; label: string; meta: string; lane: string; em: number }
> = {
  poster: {
    color: "#ff6a3d",
    label: "Poster",
    meta: "Image",
    lane: "Picture",
    em: 0.62,
  },
  teaser: {
    color: "#6f8cff",
    label: "Teaser",
    meta: "Video",
    lane: "Clip",
    em: 1.45,
  },
  score: {
    color: "#ffc83d",
    label: "Soundtrack",
    meta: "Music",
    lane: "Score",
    em: 2.1,
  },
  words: {
    color: "#b98cff",
    label: "Words",
    meta: "Copy",
    lane: "Words",
    em: 2.5,
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
  { w: " to open a night market." },
];
const SENTENCE = BRIEF.map((t) => t.w).join("");
const TOTAL = SENTENCE.length;
const NOUN_END = (() => {
  const out = {} as Record<Key, number>;
  let i = 0;
  for (const t of BRIEF) {
    i += t.w.length;
    if ("n" in t) out[t.n] = i;
  }
  return out;
})();
const ENDS = new Set(Object.values(NOUN_END));

const TAGLINES: Array<{ text: string; from: number; to: number }> = [
  { text: "Lanterns on. Kitchen open.", from: 0.04, to: 0.3 },
  { text: "Eat where the steam is.", from: 0.38, to: 0.62 },
  { text: "Fridays, after rain.", from: 0.7, to: 0.96 },
];
const FRAMES = [0.5, 1.5, 2.5, 3.5, 4.5, 0.5, 1.5, 2.5, 3.5, 4.5];
const ROT = [-5, 3, -2.5, 4];

type R = { x: number; y: number; w: number; h: number };
type Geo = {
  k0: Record<Key, R>;
  k1: Record<Key, R>;
  k2: Record<Key, R>;
  tracks: R;
  s0: R;
  s1: { x: number; y: number; s: number };
  r0: number;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function usePeaks() {
  const [peaks, setPeaks] = useState<number[]>([]);
  useEffect(() => {
    fetch("/lab/lofi-peaks.json")
      .then((r) => r.json())
      .then(setPeaks)
      .catch(() => {});
  }, []);
  return peaks;
}

function PlayButton({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause the soundtrack" : "Play the soundtrack"}
      className="grid size-8 place-items-center rounded-full border border-border-strong text-fg transition-colors hover:bg-white/10"
    >
      {playing ? (
        <Pause className="size-3.5" />
      ) : (
        <Play className="size-3.5 translate-x-px" />
      )}
    </button>
  );
}

function Dot({ k }: { k: Key }) {
  return (
    <span
      className="size-2 shrink-0 rounded-full"
      style={{ background: MEDIUM[k].color }}
    />
  );
}

/** The four made things. Their boxes are set from scroll; what is inside reads --a and --b. */
function PieceBody({ k, peaks }: { k: Key; peaks: number[] }) {
  if (k === "poster")
    return (
      // biome-ignore lint/performance/noImgElement: a box that is resized every frame
      <img
        src="/landing/lanterns.webp"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
    );
  if (k === "teaser")
    return (
      <>
        <video
          src="/landing/alley.mp4"
          poster="/landing/alley-poster.webp"
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0 flex bg-black"
          style={{ opacity: "var(--b)" }}
        >
          {FRAMES.map((f, i) => (
            // biome-ignore lint/performance/noImgElement: filmstrip frames
            <img
              // biome-ignore lint/suspicious/noArrayIndexKey: the strip repeats
              key={i}
              src={`/lab/alley-${f}.jpg`}
              alt=""
              className="aspect-video h-full shrink-0 border-r border-black/60 object-cover"
            />
          ))}
        </div>
      </>
    );
  if (k === "score") {
    const bars = peaks.length ? peaks : Array.from({ length: 120 }, () => 0.3);
    return (
      <div className="absolute inset-0 bg-[#15130e]">
        <div
          className="absolute inset-x-4 top-3.5 flex items-center gap-2.5 whitespace-nowrap"
          style={{ opacity: "calc(var(--a) - var(--b))" }}
        >
          <span className="text-[14px] font-medium text-fg">
            Night market lo-fi
          </span>
          <span className="font-mono text-[11.5px] text-mute">0:30</span>
        </div>
        <div
          className="absolute bottom-[14%] flex items-center gap-[2px]"
          style={{
            top: "calc(14% + (var(--a) - var(--b)) * 36px)",
            left: "calc(6px + (var(--a) - var(--b)) * 10px)",
            right: "calc(6px + (var(--a) - var(--b)) * 10px)",
          }}
        >
          {bars.map((p, i) => (
            <i
              // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
              key={i}
              className="block min-w-px flex-1 rounded-full bg-[#ffc83d]"
              style={{
                height: `${Math.max(8, p * 100)}%`,
                opacity: `clamp(0.3, calc((var(--play) * ${bars.length} - ${i}) * 100), 1)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-[#15111c] [container-type:size]">
      <div
        className="absolute inset-0 flex flex-col justify-center px-[clamp(6px,8cqh,16px)]"
        style={{ opacity: "calc(1 - var(--b))" }}
      >
        <p className="text-[clamp(8px,24cqh,17px)] font-medium leading-[1.25] text-fg">
          &ldquo;{TAGLINES[0].text}&rdquo;
        </p>
        <div
          className="overflow-hidden"
          style={{
            maxHeight: "calc(var(--a) * 80px)",
            opacity: "var(--a)",
          }}
        >
          {TAGLINES.slice(1).map((t) => (
            <p key={t.text} className="mt-2 text-[13.5px] leading-5 text-fg-2">
              &ldquo;{t.text}&rdquo;
            </p>
          ))}
        </div>
      </div>
      <div className="absolute inset-0" style={{ opacity: "var(--b)" }}>
        {TAGLINES.map((t) => (
          <div
            key={t.text}
            className="absolute inset-y-1.5 overflow-hidden rounded-[6px] bg-[#b98cff]/15 px-2.5"
            style={{
              left: `${t.from * 100}%`,
              width: `${(t.to - t.from) * 100}%`,
            }}
          >
            <div
              className="absolute inset-0 bg-[#b98cff]/35"
              style={{
                opacity: `clamp(0, calc(min(var(--play) - ${t.from}, ${t.to} - var(--play)) * 9999), 1)`,
              }}
            />
            <p className="relative truncate pt-1.5 text-[12.5px] leading-5 text-fg sm:pt-2">
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Unfold() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sentenceRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const k1Ref = useRef<HTMLDivElement>(null);
  const k2Ref = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pieceRefs = useRef<Partial<Record<Key, HTMLDivElement | null>>>({});
  const geo = useRef<Geo | null>(null);
  const lastP = useRef(0);
  const doneRef = useRef(false);
  const inView = useRef(true);
  const [typed, setTyped] = useState(0);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const peaks = usePeaks();
  const done = typed >= TOTAL;

  const apply = useCallback((p: number) => {
    const g = geo.current;
    const stage = stageRef.current;
    if (!g || !stage) return;
    const T1 = ease(span(p, 0.06, 0.4));
    const T2 = ease(span(p, 0.56, 0.88));
    stage.style.setProperty("--t1", T1.toFixed(4));
    stage.style.setProperty("--t2", T2.toFixed(4));

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

    const ph = playheadRef.current;
    if (ph) {
      ph.style.cssText = `left:${g.tracks.x}px;top:${g.tracks.y}px;width:${g.tracks.w}px;height:${g.tracks.h}px;opacity:${L2}`;
    }

    const st = ease(span(p, 0.04, 0.32));
    stage.style.setProperty("--st", st.toFixed(4));
    const sentence = sentenceRef.current;
    if (sentence) {
      const dx = (g.s1.x - g.s0.x) * st;
      const dy = (g.s1.y - g.s0.y) * st;
      const sc = lerp(1, g.s1.s, st);
      sentence.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${sc})`;
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
      const radius = b > 0 ? lerp(14, 8, b) : lerp(g.r0, 14, a);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot}deg)`;
      el.style.borderRadius = `${radius}px`;
      el.style.setProperty("--a", a.toFixed(4));
      el.style.setProperty("--b", b.toFixed(4));
    });
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const sentence = sentenceRef.current;
    const caption = captionRef.current;
    const k1 = k1Ref.current;
    const k2 = k2Ref.current;
    if (!stage || !sentence || !caption || !k1 || !k2) return;
    const prev = sentence.style.transform;
    sentence.style.transform = "none";
    const base = stage.getBoundingClientRect();
    const rel = (el: Element | null): R => {
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
    const pick = (root: HTMLElement, attr: string) =>
      Object.fromEntries(
        KEYS.map((k) => [k, rel(root.querySelector(`[${attr}="${k}"]`))])
      ) as Record<Key, R>;
    const s0 = rel(sentence);
    const cap = rel(caption);
    const k0 = pick(sentence, "data-slot");
    geo.current = {
      k0,
      k1: pick(k1, "data-k"),
      k2: pick(k2, "data-k"),
      tracks: (() => {
        const ruler = rel(k2.querySelector("[data-ruler]"));
        const lanes = [...k2.querySelectorAll("[data-lane]")].map(rel);
        const last = lanes[lanes.length - 1] ?? ruler;
        return {
          x: ruler.x,
          y: ruler.y,
          w: ruler.w,
          h: last.y + last.h - ruler.y,
        };
      })(),
      s0,
      s1: { x: cap.x, y: cap.y, s: cap.w / s0.w },
      r0: k0.poster.h * 0.2,
    };
    sentence.style.transform = prev;
    apply(lastP.current);
  }, [apply]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // the brief types itself; a noun pauses as its window opens
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      doneRef.current = true;
      setTyped(TOTAL);
      return;
    }
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      if (doneRef.current) return;
      i += 1;
      setTyped(i);
      if (i >= TOTAL) {
        doneRef.current = true;
        return;
      }
      const ch = SENTENCE[i - 1];
      id = setTimeout(
        step,
        ENDS.has(i) ? 360 : ch === "," ? 140 : 30 + Math.random() * 34
      );
    };
    id = setTimeout(step, 650);
    return () => clearTimeout(id);
  }, [reduced]);

  // geometry, scroll and the clock
  useEffect(() => {
    if (reduced === null) return;
    const onScroll = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = reduced ? 0.47 : total > 0 ? clamp01(-r.top / total) : 0;
      inView.current = r.bottom > 0 && r.top < window.innerHeight;
      if (p > 0.01 && !doneRef.current) {
        doneRef.current = true;
        setTyped(TOTAL);
      }
      if (p !== lastP.current) {
        lastP.current = p;
        apply(p);
      }
    };
    measure();
    onScroll();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(() => measure());
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const stage = stageRef.current;
      const audio = audioRef.current;
      if (stage && inView.current) {
        const live = !!audio && !audio.paused;
        const sec = live
          ? audio.currentTime % 30
          : ((performance.now() - t0) / 1000) % 30;
        const play = live || lastP.current > 0.7 ? sec / 30 : 1;
        stage.style.setProperty("--play", play.toFixed(4));
        if (tcRef.current)
          tcRef.current.textContent = `${fmt(play * 30)} / 0:30`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced, apply, measure]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  let idx = 0;
  const caret = (i: number) =>
    i === typed - 1 ? (
      <span
        className={`u-caret ${done ? "u-blink" : ""}`}
        style={{ opacity: "calc(1 - var(--t1) * 8)" }}
      />
    ) : null;

  return (
    <section
      ref={sectionRef}
      aria-label="One line becomes a poster, a teaser, a soundtrack and the words"
      className={
        reduced ? "relative h-svh min-h-[640px]" : "relative h-[380svh]"
      }
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh min-h-[640px] overflow-hidden bg-bg"
        style={
          {
            "--t1": 0,
            "--t2": 0,
            "--st": 0,
            "--play": 1,
          } as React.CSSProperties
        }
      >
        {/* the teaser's light spills into the room once the set is out */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-15%] bg-[url(/landing/alley-poster.webp)] bg-cover bg-center blur-[110px] saturate-[1.4]"
          style={{ opacity: "calc(var(--t1) * 0.5 - var(--t2) * 0.22)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(10_10_11/.85)_100%)]"
        />
        <div
          aria-hidden
          className="u-grain pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 bg-gradient-to-t from-bg to-transparent"
        />

        {/* K0: the brief */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 sm:px-8">
          <div className="w-full max-w-[1180px]">
            <p
              className="mb-6 flex items-center gap-2 font-mono text-[12px] text-mute sm:mb-8"
              style={{ opacity: "calc(1 - var(--st) * 8)" }}
            >
              <span className="u-pulse size-1.5 rounded-full bg-[#ff6a3d]" />
              New brief
            </p>
            <h1
              ref={sentenceRef}
              aria-label={SENTENCE}
              className="origin-top-left font-[family-name:var(--font-bricolage)] text-[clamp(38px,7.2vw,112px)] font-semibold leading-[1.04] tracking-[-0.04em] text-fg [font-stretch:90%] will-change-transform"
            >
              {typed === 0 && <span className="u-caret" />}
              {BRIEF.map((tok, ti) => {
                const chars = [...tok.w].map((ch) => {
                  const i = idx++;
                  return (
                    <span
                      key={i}
                      aria-hidden
                      style={i >= typed ? { color: "transparent" } : undefined}
                    >
                      {ch}
                      {caret(i)}
                    </span>
                  );
                });
                if (!("n" in tok))
                  // biome-ignore lint/suspicious/noArrayIndexKey: the sentence is positional
                  return <span key={ti}>{chars}</span>;
                const k = tok.n;
                const on = typed >= NOUN_END[k];
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: the sentence is positional
                  <span key={ti} className="whitespace-nowrap">
                    <span
                      data-slot={k}
                      aria-hidden
                      className="mx-[0.09em] inline-block h-[0.78em] rounded-[0.16em] align-[-0.06em]"
                      style={{
                        width: `${MEDIUM[k].em}em`,
                        background: MEDIUM[k].color,
                        opacity: "calc(var(--t1) * 0.22)",
                      }}
                    />
                    <span
                      className="bg-no-repeat transition-[background-size] duration-700 ease-[cubic-bezier(.23,1,.32,1)]"
                      style={{
                        backgroundImage: `linear-gradient(${MEDIUM[k].color},${MEDIUM[k].color})`,
                        backgroundPosition: "0 94%",
                        backgroundSize: on ? "100% 0.07em" : "0% 0.07em",
                      }}
                    >
                      {chars}
                    </span>
                  </span>
                );
              })}
            </h1>
          </div>
          <div
            className={`absolute inset-x-0 bottom-7 flex flex-col items-center gap-3 text-[12.5px] text-mute transition-opacity duration-700 ${done ? "" : "opacity-0"}`}
          >
            <span
              className="flex flex-col items-center gap-3"
              style={{ opacity: "calc(1 - var(--st) * 6)" }}
            >
              Scroll, and watch it get made
              <span className="u-cue h-9 w-px bg-gradient-to-b from-fg-2 to-transparent" />
            </span>
          </div>
        </div>

        {/* K1: the finished set */}
        <div ref={k1Ref} className="invisible absolute inset-0 z-10 opacity-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 pb-6 pt-[78px] sm:px-8 sm:pt-[92px] md:pb-10">
            <div className="flex items-start justify-between gap-6">
              <div ref={captionRef} className="h-px w-[62%] sm:w-[440px]" />
              <p className="hidden items-center gap-2 font-mono text-[12px] text-mute sm:flex">
                <span className="size-1.5 rounded-full bg-good" />4 pieces from
                one line
              </p>
            </div>
            <div className="u-grid my-auto">
              {KEYS.map((k) => (
                <div
                  key={k}
                  className="flex min-h-0 flex-col"
                  style={{ gridArea: k }}
                >
                  <div className="mb-2 flex h-6 items-center gap-2 text-[12.5px]">
                    <Dot k={k} />
                    <span className="text-fg">{MEDIUM[k].label}</span>
                    <span className="text-mute">{MEDIUM[k].meta}</span>
                    {k === "score" && (
                      <span className="ml-auto">
                        <PlayButton playing={playing} onToggle={toggle} />
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

        {/* K2: one timeline */}
        <div ref={k2Ref} className="invisible absolute inset-0 z-10 opacity-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 pb-8 pt-[200px] sm:px-8 sm:pt-[230px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-[15px] text-fg-2">
                Cut together on one timeline.
              </p>
              <div className="flex items-center gap-3">
                <span
                  ref={tcRef}
                  className="font-mono text-[12px] tabular-nums text-mute"
                >
                  0:00 / 0:30
                </span>
                <PlayButton playing={playing} onToggle={toggle} />
              </div>
            </div>
            <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 sm:grid-cols-[96px_1fr]">
              <span />
              <div data-ruler className="relative h-6 border-b border-border">
                {[0, 5, 10, 15, 20, 25, 30].map((s) => (
                  <span
                    key={s}
                    className={`absolute bottom-0 h-2 w-px bg-border-strong ${s % 10 ? "max-sm:hidden" : ""}`}
                    style={{ left: `${(s / 30) * 100}%` }}
                  >
                    <span
                      className={`absolute bottom-2.5 -translate-x-1/2 font-mono text-[10.5px] text-faint ${s === 30 ? "-translate-x-full" : s === 0 ? "translate-x-0" : ""}`}
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
                  ["words", "h-[40px] sm:h-[48px]", "inset-0"],
                ] as const
              ).map(([k, h, pos]) => (
                <div key={k} className="contents">
                  <div className="flex items-center gap-2 text-[12px] text-fg-2 sm:text-[12.5px]">
                    <Dot k={k} />
                    {MEDIUM[k].lane}
                  </div>
                  <div
                    data-lane={k}
                    className={`relative rounded-[8px] bg-white/[0.03] ${h}`}
                  >
                    <div data-k={k} className={`absolute ${pos}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the pieces */}
        {KEYS.map((k) => (
          <div
            key={k}
            ref={(el) => {
              pieceRefs.current[k] = el;
            }}
            aria-hidden
            data-on={typed >= NOUN_END[k]}
            className="u-piece pointer-events-none absolute left-0 top-0 z-20 overflow-hidden shadow-[0_24px_60px_-20px_rgb(0_0_0/.8)] outline outline-1 -outline-offset-1 outline-white/10 will-change-transform"
            style={{ "--a": 0, "--b": 0 } as React.CSSProperties}
          >
            <PieceBody k={k} peaks={peaks} />
          </div>
        ))}

        {/* the playhead rides over every lane */}
        <div
          ref={playheadRef}
          aria-hidden
          className="pointer-events-none absolute z-30 opacity-0"
        >
          <div
            className="absolute inset-y-0 w-px bg-fg"
            style={{ left: "calc(var(--play) * 100%)" }}
          >
            <span className="absolute -left-[4px] top-0 size-[9px] rotate-45 rounded-[2px] bg-fg" />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src="/landing/lofi.mp3"
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </section>
  );
}

const EXAMPLES = [
  "A poster, a ten-second teaser and a soundtrack for a night market",
  "Album art for a quiet piano record, and a name for it",
  "The sound of rain on a tin roof, twenty seconds",
];

function YourTurn() {
  const router = useRouter();
  const [mode, setMode] = useState<ComposerMode>("auto");
  const [text, setText] = useState("");
  const start = (prompt: string, m: ComposerMode) => {
    const params = new URLSearchParams({ prompt, mode: m });
    router.push(`/get-started?${params.toString()}`);
  };
  return (
    <section className="mx-auto max-w-[1200px] px-6 text-center sm:px-8">
      <h2 className="font-[family-name:var(--font-bricolage)] text-[clamp(40px,6vw,88px)] font-semibold leading-[1] tracking-[-0.04em] [font-stretch:90%]">
        Now write yours.
      </h2>
      <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-7 text-fg-2">
        One line. Aivia plans the work and makes every piece while you watch.
      </p>
      <div className="mx-auto mt-10 max-w-[720px] text-left">
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
                className="rounded-full border border-border px-3 py-1.5 text-[12.5px] leading-[18px] text-fg-2 transition-colors hover:border-border-strong hover:text-fg"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function UnfoldStudy() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg">
      <style>{`
        .u-caret{display:inline-block;position:relative;width:0;height:.8em;vertical-align:-.06em}
        .u-caret::after{content:"";position:absolute;left:.04em;top:0;width:.06em;height:100%;background:#ff6a3d;border-radius:2px}
        .u-blink::after{animation:u-blink 1.05s steps(1) infinite}
        @keyframes u-blink{50%{opacity:0}}
        .u-pulse{animation:u-pulse 1.6s ease-in-out infinite}
        @keyframes u-pulse{50%{opacity:.25}}
        .u-cue{transform-origin:top;animation:u-cue 2.2s cubic-bezier(.23,1,.32,1) infinite}
        @keyframes u-cue{0%{transform:scaleY(0)}60%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
        .u-piece{clip-path:inset(0 100% 0 0);transition:clip-path 800ms cubic-bezier(.23,1,.32,1)}
        .u-piece[data-on="true"]{clip-path:inset(0 0 0 0)}
        .u-grain{opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
        .u-grid{display:grid;width:100%;gap:12px;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr 1fr;grid-template-areas:"teaser teaser" "poster score" "poster words";height:min(520px,calc(100svh - 320px))}
        @media (min-width:768px){.u-grid{gap:16px;grid-template-columns:3.2fr 5.8fr 3fr;grid-template-rows:1fr 1fr;grid-template-areas:"poster teaser score" "poster teaser words";height:min(450px,calc(100svh - 300px))}}
        @media (prefers-reduced-motion:reduce){.u-piece{transition:none}.u-blink::after,.u-pulse,.u-cue{animation:none}}
      `}</style>
      <LandingNav />
      <main id="main" className="space-y-32">
        <Unfold />
        <YourTurn />
        <Wall />
        <StudioDemo />
        <Modes />
        <LibraryPanel />
        <Pricing />
        <Changelog />
        <Close />
      </main>
      <LandingFooter />
    </div>
  );
}
