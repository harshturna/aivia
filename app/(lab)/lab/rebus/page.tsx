"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Direction study: Rebus (TICKET-020). The sentence is the interface: as the brief types
 * itself, each noun opens a window onto the thing it became, inline, at the size of the type.
 * The composer reads your sentence the same way and marks what each word will make.
 */
const R = {
  bg: "#ffffff",
  ink: "#111110",
  mute: "#6d6c68",
  line: "#e7e5df",
  soft: "#f4f3ef",
};

type Token =
  | { t: "w"; text: string }
  | {
      t: "m";
      kind: "image" | "video" | "wave" | "words";
      src?: string;
      word: string;
    };

const HERO: Token[] = [
  { t: "w", text: "One line becomes a" },
  { t: "m", kind: "image", src: "/landing/lanterns.webp", word: "poster," },
  { t: "w", text: "a" },
  { t: "m", kind: "video", src: "/landing/alley.mp4", word: "teaser," },
  { t: "w", text: "a" },
  { t: "m", kind: "wave", src: "lofi", word: "soundtrack" },
  { t: "w", text: "and the" },
  { t: "m", kind: "words", word: "words" },
  { t: "w", text: "to sell it." },
];

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

/** A window at the height of the type, holding the made thing. */
function Chip({
  kind,
  src,
  open,
}: {
  kind: "image" | "video" | "wave" | "words";
  src?: string;
  open: boolean;
}) {
  const peaks = usePeaks(kind === "wave" ? (src ?? "lofi") : "lofi");
  const width =
    kind === "words" ? "2.9em" : kind === "wave" ? "2.4em" : "1.55em";
  return (
    <span
      aria-hidden
      className="relative mx-[0.12em] inline-block overflow-hidden align-[-0.12em] transition-[width,opacity] duration-700 ease-[cubic-bezier(.23,1,.32,1)]"
      style={{
        width: open ? width : "0em",
        height: "0.82em",
        borderRadius: "0.2em",
        opacity: open ? 1 : 0,
        background: R.soft,
      }}
    >
      {kind === "image" && (
        // biome-ignore lint/performance/noImgElement: inline output
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {kind === "video" && (
        <video
          src={src}
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {kind === "wave" && (
        <span className="absolute inset-0 flex items-center gap-[0.03em] bg-[#111110] px-[0.1em]">
          {peaks
            .filter((_, i) => i % 3 === 0)
            .map((p, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
              <i
                key={i}
                className="wave-bar block flex-1 rounded-full bg-[#ffc83d]"
                style={{
                  height: `${Math.max(10, p * 85)}%`,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
        </span>
      )}
      {kind === "words" && (
        <span className="absolute inset-0 flex items-center bg-[#111110] px-[0.5em] text-[0.2em] font-medium leading-[1.15] tracking-normal text-white [font-stretch:100%]">
          “Lanterns on, kitchen open.”
        </span>
      )}
    </span>
  );
}

function Hero() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(HERO.length);
      return;
    }
    const ids = HERO.map((_, i) =>
      setTimeout(() => setShown(i + 1), 300 + i * 380)
    );
    return () => ids.forEach(clearTimeout);
  }, []);
  return (
    <h1
      className="font-[family-name:var(--font-bricolage)] text-[clamp(42px,6.6vw,104px)] font-semibold leading-[1.06] tracking-[-0.035em] [font-stretch:88%]"
      aria-label="One line becomes a poster, a teaser, a soundtrack and the words to sell it."
    >
      {HERO.map((tok, i) =>
        tok.t === "w" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the sentence is positional
          <span
            key={i}
            className="transition-opacity duration-300"
            style={{ opacity: i < shown ? 1 : 0.12 }}
          >
            {tok.text}{" "}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: the sentence is positional
          <span
            key={i}
            className="whitespace-nowrap transition-opacity duration-300"
            style={{ opacity: i < shown ? 1 : 0.12 }}
          >
            <Chip kind={tok.kind} src={tok.src} open={i < shown} />
            {tok.word}{" "}
          </span>
        )
      )}
    </h1>
  );
}

const NOUNS: Array<{ re: RegExp; kind: string; color: string }> = [
  {
    re: /^(poster|image|picture|photo|logo|cover|art|illustration|portrait)s?[,.]?$/i,
    kind: "Picture",
    color: "#ff6a3d",
  },
  {
    re: /^(video|clip|teaser|trailer|animation|loop)s?[,.]?$/i,
    kind: "Clip",
    color: "#5b7bff",
  },
  {
    re: /^(song|track|soundtrack|music|score|jingle|beat)s?[,.]?$/i,
    kind: "Score",
    color: "#e0a400",
  },
  {
    re: /^(sound|noise|ambience|effect)s?[,.]?$/i,
    kind: "Sound",
    color: "#1fae72",
  },
  {
    re: /^(tagline|taglines|words|copy|caption|name|headline|script)[,.]?$/i,
    kind: "Words",
    color: "#111110",
  },
];

function Composer() {
  const [text, setText] = useState(
    "Album art and a thirty-second song for a quiet piano record, plus a name for it"
  );
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const found = useMemo(() => {
    const out: Array<{ word: string; kind: string; color: string }> = [];
    for (const w of words) {
      const n = NOUNS.find((x) => x.re.test(w.trim()));
      if (n)
        out.push({
          word: w.trim().replace(/[,.]$/, ""),
          kind: n.kind,
          color: n.color,
        });
    }
    return out;
  }, [words]);

  return (
    <div
      className="rounded-[20px] border p-6 md:p-8"
      style={{ borderColor: R.line }}
    >
      <label
        htmlFor="rebus-brief"
        className="text-[13px]"
        style={{ color: R.mute }}
      >
        Write a sentence. Every noun becomes something.
      </label>
      <div className="relative mt-3">
        {/* the highlighted mirror under a transparent field */}
        <div
          aria-hidden
          className="pointer-events-none whitespace-pre-wrap break-words font-[family-name:var(--font-bricolage)] text-[clamp(24px,3vw,40px)] font-medium leading-[1.25] tracking-[-0.02em] [font-stretch:92%]"
        >
          {words.map((w, i) => {
            const n = NOUNS.find((x) => x.re.test(w.trim()));
            return n ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional words
              <span
                key={i}
                style={{ boxShadow: `inset 0 -0.14em 0 ${n.color}` }}
              >
                {w}
              </span>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional words
              <span key={i}>{w}</span>
            );
          })}
          {"​"}
        </div>
        <textarea
          id="rebus-brief"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 size-full resize-none overflow-hidden bg-transparent font-[family-name:var(--font-bricolage)] text-[clamp(24px,3vw,40px)] font-medium leading-[1.25] tracking-[-0.02em] text-transparent caret-[#111110] outline-none [font-stretch:92%]"
        />
      </div>
      <div
        className="mt-6 flex flex-wrap items-center gap-2 border-t pt-5"
        style={{ borderColor: R.line }}
      >
        <span className="mr-1 text-[13px]" style={{ color: R.mute }}>
          You will get
        </span>
        {found.length === 0 && (
          <span className="text-[13px]" style={{ color: R.mute }}>
            nothing yet: name a thing
          </span>
        )}
        {found.map((f, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional results
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px]"
            style={{ borderColor: R.line }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: f.color }}
            />
            {f.kind}
            <span style={{ color: R.mute }}>from “{f.word}”</span>
          </span>
        ))}
        <button
          type="button"
          className="ml-auto rounded-full px-5 py-2.5 text-[14px] font-medium text-white"
          style={{ background: R.ink }}
        >
          Make it
        </button>
      </div>
    </div>
  );
}

const EXAMPLES: Token[][] = [
  [
    { t: "w", text: "A" },
    { t: "m", kind: "image", src: "/landing/cup.webp", word: "still life" },
    { t: "w", text: "for the café menu." },
  ],
  [
    { t: "w", text: "Ink unfurling, as a" },
    { t: "m", kind: "video", src: "/landing/ink.mp4", word: "title card." },
  ],
  [
    { t: "w", text: "Rain on a tin roof, as a" },
    { t: "m", kind: "wave", src: "rain", word: "sound." },
  ],
  [
    { t: "w", text: "A" },
    { t: "m", kind: "image", src: "/landing/moto.webp", word: "garage" },
    { t: "w", text: "shot for the shop window." },
  ],
];

export default function RebusStudy() {
  return (
    <div className="min-h-dvh" style={{ background: R.bg, color: R.ink }}>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(.6)}50%{transform:scaleY(1)}} .wave-bar{animation:wave 1.2s ease-in-out infinite;transform-origin:center} @media (prefers-reduced-motion:reduce){.wave-bar{animation:none}}`}</style>
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center gap-7 px-6 text-[14px]">
        <span className="font-[family-name:var(--font-bricolage)] text-[22px] font-bold tracking-[-0.03em]">
          aivia
        </span>
        <span style={{ color: R.mute }}>Pricing</span>
        <span style={{ color: R.mute }}>Changelog</span>
        <span
          className="ml-auto rounded-full px-4 py-2 font-medium text-white"
          style={{ background: R.ink }}
        >
          Start making
        </span>
      </nav>

      <header className="mx-auto max-w-[1240px] px-6 pb-16 pt-14 md:pt-24">
        <Hero />
      </header>

      <section className="mx-auto max-w-[1240px] px-6 pb-24">
        <Composer />
      </section>

      <section
        className="mx-auto max-w-[1240px] border-t px-6 py-24"
        style={{ borderColor: R.line }}
      >
        <h2 className="mb-10 text-[15px]" style={{ color: R.mute }}>
          Things people asked for this week
        </h2>
        <ul className="space-y-6">
          {EXAMPLES.map((line, li) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed examples
            <li
              key={li}
              className="font-[family-name:var(--font-bricolage)] text-[clamp(28px,4vw,56px)] font-semibold leading-[1.1] tracking-[-0.03em] [font-stretch:88%]"
            >
              {line.map((tok, i) =>
                tok.t === "w" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional
                  <span key={i}>{tok.text} </span>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional
                  <span key={i} className="whitespace-nowrap">
                    <Chip kind={tok.kind} src={tok.src} open />
                    {tok.word}{" "}
                  </span>
                )
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
