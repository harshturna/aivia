"use client";

import { useState } from "react";

/**
 * Direction study: Print shop (TICKET-020). Two riso inks on paper: every output is pulled
 * as a numbered print, overprinted blue and fluorescent pink with a little misregistration;
 * hover shows the proof in full colour. The composer is a job ticket.
 */
const P = {
  paper: "#f1ece1",
  blue: "#0078bf",
  pink: "#ff48b0",
  ink: "#1d1c1a",
  mute: "#6b675f",
};

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** The two inks as SVG duotone filters, defined once on the page. */
function Inks() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="ink-blue" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0 0.945 0.945" />
          <feFuncG type="table" tableValues="0.47 0.925 0.925" />
          <feFuncB type="table" tableValues="0.75 0.882 0.882" />
        </feComponentTransfer>
      </filter>
      <filter id="ink-pink" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="1 1 0.945" />
          <feFuncG type="table" tableValues="0.28 0.5 0.925" />
          <feFuncB type="table" tableValues="0.69 0.76 0.882" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

function Print({
  src,
  alt,
  no,
  caption,
  tilt,
  ratio = "3/4",
}: {
  src: string;
  alt: string;
  no: number;
  caption: string;
  tilt: number;
  ratio?: string;
}) {
  const [proof, setProof] = useState(false);
  return (
    <figure
      className="group"
      style={{ transform: `rotate(${tilt}deg)` }}
      onMouseEnter={() => setProof(true)}
      onMouseLeave={() => setProof(false)}
    >
      <div className="relative overflow-hidden bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.06),0_14px_30px_-18px_rgba(40,30,10,0.45)]">
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: ratio }}
        >
          {/* biome-ignore lint/performance/noImgElement: duotone layers of one generated image */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 size-full object-cover"
            style={{ filter: "url(#ink-blue)" }}
          />
          {/* biome-ignore lint/performance/noImgElement: the pink pass, slightly off register */}
          <img
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover mix-blend-multiply"
            style={{
              filter: "url(#ink-pink)",
              transform: "translate(2px,-1.5px)",
              opacity: 0.85,
            }}
          />
          {/* biome-ignore lint/performance/noImgElement: the full-colour proof on hover */}
          <img
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover transition-opacity duration-500"
            style={{ opacity: proof ? 1 : 0 }}
          />
        </div>
        <div
          className="mt-3 flex items-baseline justify-between gap-3 text-[12.5px]"
          style={{ color: P.ink }}
        >
          <span className="font-[family-name:var(--font-archivo)] font-bold [font-stretch:70%]">
            No. {String(no).padStart(3, "0")}
          </span>
          <span className="truncate" style={{ color: P.mute }}>
            {proof ? "The proof" : caption}
          </span>
        </div>
      </div>
    </figure>
  );
}

function Overprint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <span
        aria-hidden
        className="absolute left-[0.014em] top-[-0.01em] mix-blend-multiply"
        style={{ color: P.pink, opacity: 0.85 }}
      >
        {children}
      </span>
      <span className="relative mix-blend-multiply" style={{ color: P.blue }}>
        {children}
      </span>
    </span>
  );
}

export default function PrintStudy() {
  const [inks, setInks] = useState<Record<string, boolean>>({
    Picture: true,
    Clip: true,
    Score: true,
    Sound: false,
    Words: true,
  });
  return (
    <div
      className="relative min-h-dvh overflow-x-clip"
      style={{ background: P.paper, color: P.ink }}
    >
      <Inks />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      <nav className="mx-auto flex h-16 max-w-[1280px] items-center gap-7 px-6 text-[14px]">
        <span className="font-[family-name:var(--font-archivo)] text-[24px] font-black uppercase tracking-[-0.01em] [font-stretch:62%]">
          <Overprint>Aivia</Overprint>
        </span>
        <span style={{ color: P.mute }}>Pricing</span>
        <span style={{ color: P.mute }}>Changelog</span>
        <span
          className="ml-auto border-2 px-3.5 py-1.5 font-semibold"
          style={{ borderColor: P.ink }}
        >
          Open the studio
        </span>
      </nav>

      <header className="mx-auto grid max-w-[1280px] gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
        <h1 className="font-[family-name:var(--font-archivo)] text-[clamp(84px,14vw,232px)] font-black uppercase leading-[0.8] tracking-[-0.02em] [font-stretch:62%]">
          <Overprint>One line,</Overprint>
          <br />
          <Overprint>many prints.</Overprint>
        </h1>

        {/* the composer as a job ticket */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative -rotate-1 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(40,30,10,0.5)]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10px 0, transparent 6px, white 6.5px)",
            backgroundSize: "20px 100%",
          }}
        >
          <div
            className="flex items-baseline justify-between border-b-2 border-dashed pb-3"
            style={{ borderColor: P.ink }}
          >
            <span className="font-[family-name:var(--font-archivo)] text-[20px] font-black uppercase [font-stretch:70%]">
              Job ticket
            </span>
            <span className="font-[family-name:var(--font-archivo)] text-[14px] font-bold [font-stretch:70%]">
              No. 0142
            </span>
          </div>
          <label
            htmlFor="job"
            className="mt-5 block text-[13px]"
            style={{ color: P.mute }}
          >
            What should we print?
          </label>
          <textarea
            id="job"
            rows={3}
            defaultValue="A poster, a ten-second teaser and a soundtrack for a night market. Keep it warm."
            className="mt-2 w-full resize-none bg-transparent text-[18px] leading-7 outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.keys(inks).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={inks[k]}
                onClick={() => setInks((s) => ({ ...s, [k]: !s[k] }))}
                className="border-2 px-2.5 py-1 text-[13px] font-medium transition-colors"
                style={{
                  borderColor: P.ink,
                  background: inks[k] ? P.ink : "transparent",
                  color: inks[k] ? P.paper : P.ink,
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="mt-6 w-full py-3 font-[family-name:var(--font-archivo)] text-[18px] font-black uppercase tracking-[0.01em] text-white [font-stretch:75%]"
            style={{ background: P.blue, boxShadow: `3px 3px 0 ${P.pink}` }}
          >
            Pull the print
          </button>
        </form>
      </header>

      <section className="mx-auto max-w-[1280px] px-6 pb-28">
        <div
          className="mb-10 flex items-end justify-between gap-6 border-t-2 pt-5"
          style={{ borderColor: P.ink }}
        >
          <h2 className="font-[family-name:var(--font-archivo)] text-[clamp(40px,5vw,72px)] font-black uppercase leading-[0.85] [font-stretch:62%]">
            Fresh off the press
          </h2>
          <p
            className="max-w-[34ch] text-[15px] leading-6"
            style={{ color: P.mute }}
          >
            Every brief comes back as a run of prints: the picture, the clip,
            the score. Hover to see the proof in full colour.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <Print
            src="/landing/lanterns.webp"
            alt="Lanterns over a wet alley"
            no={14}
            caption="Lanterns over a wet alley"
            tilt={-1.5}
          />
          <Print
            src="/landing/vase.webp"
            alt="A black vase with pampas grass"
            no={15}
            caption="A vase under one light"
            tilt={1}
          />
          <Print
            src="/landing/espresso.webp"
            alt="Espresso pouring"
            no={16}
            caption="Espresso, warm light"
            tilt={-0.5}
          />
          <Print
            src="/landing/stair.webp"
            alt="A concrete spiral stair"
            no={17}
            caption="A spiral stair at four"
            tilt={1.8}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-32">
        <div
          className="mb-8 flex items-end justify-between gap-6 border-t-2 pt-5"
          style={{ borderColor: P.ink }}
        >
          <h2 className="font-[family-name:var(--font-archivo)] text-[clamp(40px,5vw,72px)] font-black uppercase leading-[0.85] [font-stretch:62%]">
            The clip, frame by frame
          </h2>
          <p
            className="max-w-[34ch] text-[15px] leading-6"
            style={{ color: P.mute }}
          >
            A ten-second teaser, pulled as a strip.
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[
            "alley-0.5",
            "alley-1.5",
            "alley-2.5",
            "alley-3.5",
            "alley-4.5",
            "sea-1.5",
            "ink-2.5",
          ].map((f, i) => (
            <div key={f} className="w-[220px] shrink-0">
              <Print
                src={`/lab/${f}.jpg`}
                alt="A frame from the teaser"
                no={18 + i}
                caption={`Frame ${i + 1}`}
                tilt={0}
                ratio="16/9"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
