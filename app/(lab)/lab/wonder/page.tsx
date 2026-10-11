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
 * Direction study: Wonder (TICKET-020). The unfold sequence set at dawn above a sea of
 * clouds. The brief is written across the sky; each noun opens an arched window onto the
 * thing it became; on scroll the windows gather into a triptych floating on the clouds, then
 * flatten into lanes on one timeline: the old shape becoming the tool.
 */
type Key = "poster" | "teaser" | "score" | "words";
const KEYS: Key[] = ["poster", "teaser", "score", "words"];

const MEDIUM: Record<
  Key,
  { tint: string; label: string; meta: string; lane: string; em: number }
> = {
  poster: {
    tint: "#f2a68e",
    label: "Poster",
    meta: "Image",
    lane: "Picture",
    em: 0.6,
  },
  teaser: {
    tint: "#a9c3ee",
    label: "Teaser",
    meta: "Video",
    lane: "Clip",
    em: 1.4,
  },
  score: {
    tint: "#e8b86a",
    label: "Soundtrack",
    meta: "Music",
    lane: "Score",
    em: 2.0,
  },
  words: {
    tint: "#cdb9f2",
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
  { w: " for a castle above the clouds." },
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
  { text: "Where the mountains keep the light.", from: 0.04, to: 0.32 },
  { text: "Climb at first light.", from: 0.4, to: 0.62 },
  { text: "Above the clouds, the gates are open.", from: 0.68, to: 0.97 },
];
const FRAMES = [0.5, 1.5, 2.5, 3.5, 4.5, 0.5, 1.5, 2.5, 3.5, 4.5];
const ROT = [-4, 2.5, -2, 3.5];
const W = "/lab/wonder";

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

function usePeaks() {
  const [peaks, setPeaks] = useState<number[]>([]);
  useEffect(() => {
    fetch(`${W}/score-peaks.json`)
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
      className="grid size-8 place-items-center rounded-full border border-[#f4eedf]/30 bg-[#0c1222]/30 text-[#f4eedf] backdrop-blur transition-colors hover:bg-[#f4eedf]/15"
    >
      {playing ? (
        <Pause className="size-3.5" />
      ) : (
        <Play className="size-3.5 translate-x-px" />
      )}
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

/** The four made things. Their boxes are set from scroll; what is inside reads --a and --b. */
function PieceBody({ k, peaks }: { k: Key; peaks: number[] }) {
  if (k === "poster")
    return (
      // biome-ignore lint/performance/noImgElement: a box that is resized every frame
      <img
        src={`${W}/poster.webp`}
        alt=""
        className="absolute inset-0 size-full object-cover object-[50%_30%]"
      />
    );
  if (k === "teaser")
    return (
      <>
        <video
          src={`${W}/falls.mp4`}
          poster={`${W}/falls.webp`}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0 flex bg-[#0c1222]"
          style={{ opacity: "var(--b)" }}
        >
          {FRAMES.map((f, i) => (
            // biome-ignore lint/performance/noImgElement: filmstrip frames
            <img
              // biome-ignore lint/suspicious/noArrayIndexKey: the strip repeats
              key={i}
              src={`${W}/falls-${f}.jpg`}
              alt=""
              className="aspect-video h-full shrink-0 border-r border-[#0c1222]/70 object-cover"
            />
          ))}
        </div>
      </>
    );
  if (k === "score") {
    const bars = peaks.length ? peaks : Array.from({ length: 120 }, () => 0.3);
    return (
      <div className="absolute inset-0 bg-[#121a2c] [container-type:size]">
        <div
          className="absolute inset-x-5 top-[24%] flex items-baseline justify-center gap-2.5 whitespace-nowrap"
          style={{ opacity: "calc(var(--a) - var(--b))" }}
        >
          <span className="font-[family-name:var(--font-cormorant)] text-[clamp(12px,8cqw,21px)] font-medium italic leading-none text-[#f4eedf]">
            Dawn over the citadel
          </span>
          <span className="text-[12px] tabular-nums text-[#8d97ab] max-md:hidden">
            0:30
          </span>
        </div>
        <div
          className="absolute bottom-[16%] flex items-center gap-[2px]"
          style={{
            top: "calc(16% + (var(--a) - var(--b)) * 32%)",
            left: "calc(6px + (var(--a) - var(--b)) * 10px)",
            right: "calc(6px + (var(--a) - var(--b)) * 10px)",
          }}
        >
          {bars.map((p, i) => (
            <i
              // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
              key={i}
              className="block min-w-px flex-1 rounded-full bg-[#e8b86a]"
              style={{
                height: `${Math.max(8, p * 100)}%`,
                opacity: `clamp(0.28, calc((var(--play) * ${bars.length} - ${i}) * 100), 1)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-[#18172b] [container-type:size]">
      <div
        className="absolute inset-0 flex flex-col justify-center px-[clamp(6px,9cqh,22px)] pt-[calc(var(--a)*14%)] text-center"
        style={{ opacity: "calc(1 - var(--b))" }}
      >
        <p className="font-[family-name:var(--font-cormorant)] text-[clamp(9px,min(26cqh,11cqw),22px)] font-medium italic leading-[1.15] text-[#f4eedf]">
          &ldquo;{TAGLINES[0].text}&rdquo;
        </p>
        <div
          className="overflow-hidden"
          style={{ maxHeight: "calc(var(--a) * 40px)", opacity: "var(--a)" }}
        >
          {TAGLINES.slice(1, 2).map((t) => (
            <p
              key={t.text}
              className="mt-2 font-[family-name:var(--font-cormorant)] text-[17px] italic leading-6 text-[#b9c0d0]"
            >
              &ldquo;{t.text}&rdquo;
            </p>
          ))}
        </div>
      </div>
      <div className="absolute inset-0" style={{ opacity: "var(--b)" }}>
        {TAGLINES.map((t) => (
          <div
            key={t.text}
            className="absolute inset-y-1.5 overflow-hidden rounded-[6px] bg-[#cdb9f2]/12 px-2.5"
            style={{
              left: `${t.from * 100}%`,
              width: `${(t.to - t.from) * 100}%`,
            }}
          >
            <div
              className="absolute inset-0 bg-[#cdb9f2]/30"
              style={{
                opacity: `clamp(0, calc(min(var(--play) - ${t.from}, ${t.to} - var(--play)) * 9999), 1)`,
              }}
            />
            <p className="relative truncate pt-1.5 font-[family-name:var(--font-cormorant)] text-[16px] font-medium italic leading-5 text-[#f4eedf] sm:pt-2.5">
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** An astrolabe ring: the instrument behind the triptych. */
function Ring() {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg viewBox="-100 -100 200 200" className="size-full" aria-hidden>
      <circle
        r="96"
        fill="none"
        stroke="#f4eedf"
        strokeOpacity=".22"
        strokeWidth=".25"
      />
      <circle
        r="88"
        fill="none"
        stroke="#f4eedf"
        strokeOpacity=".14"
        strokeWidth=".25"
        strokeDasharray=".6 1.6"
      />
      <circle
        r="62"
        fill="none"
        stroke="#e8b86a"
        strokeOpacity=".22"
        strokeWidth=".2"
      />
      {ticks.map((d) => (
        <line
          key={d}
          x1="0"
          y1={d % 30 ? -93 : -90}
          x2="0"
          y2="-96"
          stroke="#f4eedf"
          strokeOpacity={d % 30 ? 0.18 : 0.38}
          strokeWidth=".25"
          transform={`rotate(${d})`}
        />
      ))}
      <line
        x1="-96"
        y1="0"
        x2="96"
        y2="0"
        stroke="#f4eedf"
        strokeOpacity=".08"
        strokeWidth=".2"
      />
      <line
        x1="0"
        y1="-96"
        x2="0"
        y2="96"
        stroke="#f4eedf"
        strokeOpacity=".08"
        strokeWidth=".2"
      />
    </svg>
  );
}

function Wonder() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sentenceRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const k1Ref = useRef<HTMLDivElement>(null);
  const k2Ref = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
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
    const st = ease(span(p, 0.04, 0.32));
    stage.style.setProperty("--t1", T1.toFixed(4));
    stage.style.setProperty("--t2", T2.toFixed(4));
    stage.style.setProperty("--st", st.toFixed(4));

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

    // the world: the sky tilts away, the veil deepens, clouds rise under the set then fall
    if (skyRef.current)
      skyRef.current.style.transform = `translate3d(0,${(T1 * 5 + T2 * 4).toFixed(2)}%,0) scale(${(1 + T1 * 0.06).toFixed(4)})`;
    if (veilRef.current)
      veilRef.current.style.opacity = (T1 * 0.5 + T2 * 0.3).toFixed(3);
    if (cloudsRef.current) {
      const y = T2 > 0 ? lerp(0.17, 0.6, T2) : lerp(0.22, 0.17, T1);
      cloudsRef.current.style.transform = `translate3d(0,${(y * g.vh).toFixed(1)}px,0)`;
      cloudsRef.current.style.filter = `brightness(${(1 - T1 * 0.16).toFixed(3)})`;
    }
    if (mistRef.current)
      mistRef.current.style.transform = `translate3d(0,${(-p * 0.25 * g.vh).toFixed(1)}px,0)`;
    if (ringRef.current) {
      ringRef.current.style.opacity = (L1 * 0.9 + L2 * 0.25).toFixed(3);
      ringRef.current.style.transform = `translate(-50%,-50%) rotate(${(p * 70).toFixed(2)}deg) scale(${(0.9 + T1 * 0.1 + T2 * 0.25).toFixed(3)})`;
    }

    const ph = playheadRef.current;
    if (ph)
      ph.style.cssText = `left:${g.tracks.x}px;top:${g.tracks.y}px;width:${g.tracks.w}px;height:${g.tracks.h}px;opacity:${L2}`;

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
      // an arch until the timeline: round-headed windows flatten into lanes
      const arch = 1 - b;
      const rx = lerp(7, w / 2, arch);
      const ry = lerp(7, w > h ? Math.min(h * 0.3, w / 2) : w / 2, arch);
      const rb = lerp(Math.max(2, h * 0.04), 7, b);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot}deg)`;
      el.style.borderRadius = `${rx}px ${rx}px ${rb}px ${rb}px / ${ry}px ${ry}px ${rb}px ${rb}px`;
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
    const ruler = rel(k2.querySelector("[data-ruler]"));
    const lanes = [...k2.querySelectorAll("[data-lane]")].map(rel);
    const last = lanes[lanes.length - 1] ?? ruler;
    geo.current = {
      k0: pick(sentence, "data-slot"),
      k1: pick(k1, "data-k"),
      k2: pick(k2, "data-k"),
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
    for (const el of [cloudsRef.current, mistRef.current])
      el?.style.setProperty(
        "--tile",
        `${((el.offsetHeight * 1800) / 1028).toFixed(1)}px`
      );
    sentence.style.transform = prev;
    apply(lastP.current);
  }, [apply]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // the brief writes itself across the sky; a noun pauses as its window opens
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
        ENDS.has(i) ? 380 : ch === "," ? 150 : 32 + Math.random() * 36
      );
    };
    id = setTimeout(step, 1100);
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
        className={`w-caret ${done ? "w-blink" : ""}`}
        style={{ opacity: "calc(1 - var(--st) * 8)" }}
      />
    ) : null;

  return (
    <section
      ref={sectionRef}
      aria-label={SENTENCE}
      className={
        reduced ? "relative h-svh min-h-[640px]" : "relative h-[380svh]"
      }
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh min-h-[640px] overflow-hidden bg-[#0c1222]"
        style={
          {
            "--t1": 0,
            "--t2": 0,
            "--st": 0,
            "--play": 1,
          } as React.CSSProperties
        }
      >
        {/* the world */}
        <div
          ref={skyRef}
          aria-hidden
          className="absolute inset-0 origin-[60%_70%]"
        >
          <div className="w-sky w-arrive absolute inset-0" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(12_18_34/.7)_0%,rgb(12_18_34/.42)_45%,rgb(12_18_34/.12)_68%,transparent_82%)]"
        />
        <div
          ref={mistRef}
          aria-hidden
          className="w-drift-slow pointer-events-none absolute inset-x-0 top-[38%] h-[34%] bg-[url(/lab/wonder/mist.webp)] bg-[length:auto_100%] bg-repeat-x opacity-30"
        />
        <div
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#0c1222] opacity-0"
        />
        <div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[57%] z-[6] aspect-square w-[min(118vh,150vw)] opacity-0"
        >
          <Ring />
        </div>

        {/* K0: the brief, written across the sky */}
        <div className="absolute inset-x-0 top-0 z-10 px-5 pt-[16svh] sm:px-8 sm:pt-[17svh]">
          <div className="mx-auto w-full max-w-[1240px]">
            <h1
              ref={sentenceRef}
              aria-label={SENTENCE}
              className="max-w-[1180px] origin-top-left font-[family-name:var(--font-cormorant)] text-[clamp(44px,7.4vw,124px)] font-medium leading-[0.96] tracking-[-0.015em] text-[#f6f0e2] [text-shadow:0_1px_2px_rgb(12_18_34/.35),0_4px_40px_rgb(12_18_34/.55)] will-change-transform"
            >
              {typed === 0 && <span className="w-caret" />}
              {BRIEF.map((tok, ti) => {
                const chars = [...tok.w].map((ch) => {
                  const i = idx++;
                  return (
                    <span
                      key={i}
                      aria-hidden
                      style={
                        i >= typed
                          ? { color: "transparent", textShadow: "none" }
                          : undefined
                      }
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
                      className="mx-[0.08em] inline-block h-[0.72em] rounded-t-full align-[-0.04em]"
                      style={{
                        width: `${MEDIUM[k].em}em`,
                        background: MEDIUM[k].tint,
                        opacity: "calc(var(--t1) * 0.28)",
                      }}
                    />
                    <span
                      className="bg-no-repeat transition-[background-size] duration-1000 ease-[cubic-bezier(.23,1,.32,1)]"
                      style={{
                        backgroundImage: `linear-gradient(${MEDIUM[k].tint},${MEDIUM[k].tint})`,
                        backgroundPosition: "0 96%",
                        backgroundSize: on ? "100% 0.045em" : "0% 0.045em",
                      }}
                    >
                      {chars}
                    </span>
                  </span>
                );
              })}
            </h1>
            <p
              className={`mt-8 flex items-center gap-3 text-[14px] text-[#f4eedf] transition-opacity duration-1000 ${done ? "" : "opacity-0"}`}
            >
              <span
                className="flex items-center gap-3 rounded-full bg-[#0c1222]/45 py-2 pl-3 pr-4 backdrop-blur-md"
                style={{ opacity: "calc(1 - var(--st) * 6)" }}
              >
                <span className="w-cue h-px w-8 bg-[#f4eedf]/80" />
                Scroll, and watch it get made
              </span>
            </p>
          </div>
        </div>

        {/* K1: the triptych */}
        <div ref={k1Ref} className="invisible absolute inset-0 z-10 opacity-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 pb-6 pt-[78px] sm:px-8 sm:pt-[92px] md:pb-10">
            <div className="flex items-start justify-between gap-6">
              <div ref={captionRef} className="h-px w-[54%] sm:w-[460px]" />
              <p className="hidden text-[13px] text-[#f4eedf]/75 sm:block">
                Four things from one line
              </p>
            </div>
            <div className="w-grid mt-auto md:my-auto">
              {KEYS.map((k) => (
                <div
                  key={k}
                  className="flex min-h-0 flex-col"
                  style={{ gridArea: k }}
                >
                  <div className="mb-2 flex h-7 items-center gap-2 text-[13px]">
                    <Mark k={k} />
                    <span className="text-[#f4eedf]">{MEDIUM[k].label}</span>
                    <span className="text-[#f4eedf]/55">{MEDIUM[k].meta}</span>
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
          <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 pb-8 pt-[210px] sm:px-8 sm:pt-[240px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="font-[family-name:var(--font-cormorant)] text-[19px] italic text-[#f4eedf] sm:text-[22px]">
                Cut together on one timeline.
              </p>
              <div className="flex items-center gap-3">
                <span
                  ref={tcRef}
                  className="whitespace-nowrap text-[12.5px] tabular-nums text-[#f4eedf]/60"
                >
                  0:00 / 0:30
                </span>
                <PlayButton playing={playing} onToggle={toggle} />
              </div>
            </div>
            <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 sm:grid-cols-[96px_1fr]">
              <span />
              <div
                data-ruler
                className="relative h-6 border-b border-[#f4eedf]/20"
              >
                {[0, 5, 10, 15, 20, 25, 30].map((s) => (
                  <span
                    key={s}
                    className={`absolute bottom-0 h-2 w-px bg-[#f4eedf]/35 ${s % 10 ? "max-sm:hidden" : ""}`}
                    style={{ left: `${(s / 30) * 100}%` }}
                  >
                    <span
                      className={`absolute bottom-2.5 text-[11px] tabular-nums text-[#f4eedf]/45 ${s === 30 ? "-translate-x-full" : s === 0 ? "" : "-translate-x-1/2"}`}
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
                  <div className="flex items-center gap-2 text-[12.5px] text-[#f4eedf]/80">
                    <Mark k={k} />
                    {MEDIUM[k].lane}
                  </div>
                  <div
                    data-lane={k}
                    className={`relative rounded-[7px] bg-[#0c1222]/45 backdrop-blur-md ${h}`}
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
            className="w-piece pointer-events-none absolute left-0 top-0 z-20 overflow-hidden shadow-[0_30px_80px_-24px_rgb(6_10_22/.85)] outline outline-1 -outline-offset-1 outline-[#f4eedf]/20 will-change-transform"
            style={{ "--a": 0, "--b": 0 } as React.CSSProperties}
          >
            <PieceBody k={k} peaks={peaks} />
          </div>
        ))}

        {/* the near clouds: they gather under the set, then fall away */}
        <div
          ref={cloudsRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[32%] md:h-[46%]"
        >
          <div className="w-drift absolute inset-0 bg-[url(/lab/wonder/clouds.webp)] bg-[length:auto_100%] bg-repeat-x" />
        </div>

        {/* the playhead rides over every lane */}
        <div
          ref={playheadRef}
          aria-hidden
          className="pointer-events-none absolute z-30 opacity-0"
        >
          <div
            className="absolute inset-y-0 w-px bg-[#f6f0e2]"
            style={{ left: "calc(var(--play) * 100%)" }}
          >
            <span className="absolute -left-[4px] -top-1 h-3 w-[9px] rounded-t-full bg-[#e8b86a]" />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[26] h-40 bg-gradient-to-t from-[#0c1222] to-transparent"
          style={{ opacity: "var(--t2)" }}
        />
      </div>
      <audio
        ref={audioRef}
        src={`${W}/score.mp3`}
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </section>
  );
}

const EXAMPLES = [
  "A poster, a ten-second teaser and a soundtrack for a castle above the clouds",
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
      <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(48px,7vw,104px)] font-medium leading-[0.95] tracking-[-0.015em]">
        Now write yours.
      </h2>
      <p className="mx-auto mt-6 max-w-[46ch] text-[17px] leading-7 text-fg-2">
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

/** The dawn palette, laid over the app's tokens for this page only. */
const DAWN = {
  "--color-bg": "#0c1222",
  "--color-surface": "#131b2e",
  "--color-surface-2": "#1a2339",
  "--color-surface-3": "#232d46",
  "--color-border": "rgb(244 238 223 / 0.09)",
  "--color-border-strong": "rgb(244 238 223 / 0.18)",
  "--color-fg": "#f4eedf",
  "--color-fg-2": "#b9c0d0",
  "--color-mute": "#8d97ab",
  "--color-glass": "rgb(12 18 34 / 0.72)",
} as React.CSSProperties;

export default function WonderStudy() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg" style={DAWN}>
      <style>{`
        .w-sky{background:url(/lab/wonder/sky.webp) 60% 50%/cover no-repeat}
        @media (max-aspect-ratio:3/4){.w-sky{background-image:url(/lab/wonder/sky-tall.webp);background-position:50% 50%}}
        .w-arrive{animation:w-arrive 3.2s cubic-bezier(.23,1,.32,1) both}
        @keyframes w-arrive{from{transform:scale(1.14);filter:brightness(.55) saturate(.8)}to{transform:scale(1.03);filter:none}}
        .w-drift{animation:w-drift 140s linear infinite}
        .w-drift-slow{animation:w-drift 200s linear infinite reverse}
        @keyframes w-drift{from{background-position-x:0}to{background-position-x:calc(var(--tile,1800px) * -1)}}
        .w-caret{display:inline-block;position:relative;width:0;height:.74em;vertical-align:-.04em}
        .w-caret::after{content:"";position:absolute;left:.05em;top:0;width:.035em;height:100%;background:#e8b86a;border-radius:2px}
        .w-blink::after{animation:w-blink 1.1s steps(1) infinite}
        @keyframes w-blink{50%{opacity:0}}
        .w-cue{transform-origin:left;animation:w-cue 2.4s cubic-bezier(.23,1,.32,1) infinite}
        @keyframes w-cue{0%{transform:scaleX(0)}60%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
        .w-piece{clip-path:inset(100% 0 0 0);transition:clip-path 1000ms cubic-bezier(.23,1,.32,1)}
        .w-piece[data-on="true"]{clip-path:inset(0 0 0 0)}
        .w-grid{display:grid;width:100%;gap:12px;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr 1fr;grid-template-areas:"teaser teaser" "poster score" "poster words";height:min(500px,calc(100svh - 350px))}
        @media (min-width:768px){.w-grid{gap:18px;grid-template-columns:3.2fr 5.8fr 3fr;grid-template-rows:1fr 1fr;grid-template-areas:"poster teaser score" "poster teaser words";height:min(470px,calc(100svh - 300px))}}
        @media (prefers-reduced-motion:reduce){.w-piece{transition:none}.w-arrive,.w-drift,.w-drift-slow,.w-blink::after,.w-cue{animation:none}}
      `}</style>
      <LandingNav />
      <main id="main" className="space-y-32">
        <Wonder />
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
