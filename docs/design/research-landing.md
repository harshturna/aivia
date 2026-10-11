# Research: landing pages of AI creative tools, October 2026

Collected 2026-10-10 for the revamp design (TICKET-002). Method: the live HTML and CSS of about
thirty sites, read for their font families, hero sizes, colour frequencies, easing curves and
media usage. Midjourney, Ideogram, Lovable, Sora, lapa.ninja and land-book sat behind bot walls;
secondary teardowns stood in for Sora and Midjourney. Kept here as the evidence behind D-001.

## 1. Structural patterns

1. **An announcement bar, then a short claim over or beside moving output.** Runway, ElevenLabs,
   Luma, Krea and Linear all open with a dated "new" bar. Headlines are small and the media does
   the selling: Runway's hero h1 is 28 to 40 px white over a dark image; Cursor's is 26 px; Krea
   stacks several hero videos that crossfade with only the active one preloaded; Pika's hero is
   one muted loop that fades in over 700 ms; Sora's is all moving video around a prompt field.
2. **The product shown as a working replica, not a screenshot.** Cursor's interactive IDE and
   CLI; Linear's per-section mockups; ElevenLabs' playable player; Krea's mock prompt box with
   aspect and style controls; v0's h1 is literally the prompt box; Suno's hero has a blinking
   caret. Static screenshots are declining and pages without a live or recorded demo convert
   worse (Landdding 2026, 2,473 pages).
3. **A model strip and a logo strip as credibility.** Pika lists eight models; Krea runs a
   Veo / Ideogram / Runway / Luma / Flux strip; then press or customer logos.
4. **A capability grid whose thumbnails are real outputs.** Pika's eight app cards each
   hover-play a video. Icons-in-cards are gone at this tier.
5. **A creator gallery with attribution.** Made with Pika, Suno's six creator cards, Krea's six
   images with prompt captions. Midjourney's homepage is only the gallery.
6. **A research, changelog or news tail.** The strongest "real company" signal: Runway, Luma,
   Pika, ElevenLabs, Cursor and Linear all end with dated cards.
7. **Pricing mostly off the homepage; dense small footers.** Four self-serve tiers, a yearly
   toggle, credits translated into outputs, a four-question FAQ. Footers are multi-column at
   13 to 15 px. The close is one line: "Try Cursor now.", "Join Suno for free".

## 2. Typography

| Site | Sans | Serif | Mono |
|---|---|---|---|
| Runway | ABC Normal | Times Now | Geist Mono |
| Luma | Graphik | PP Editorial | |
| Suno | Neue Montreal | Editorial New | Input Sans |
| Pika | Telka + Telka Extended | | |
| Krea | Suisse Intl | | Suisse Intl Mono |
| ElevenLabs | Waldenburg, Inter | | Geist Mono |
| Attio | Inter + Inter Display | Tiempos Text | JetBrains Mono |
| Resend | ABC Favorit | Domaine | Commit Mono |
| Claude.com | Anthropic Sans | Anthropic Serif | Anthropic Mono |
| Flora | Geist | Exposure | |
| Raycast | Inter | Instrument Serif | JetBrains Mono |
| Linear | Inter Variable | | |
| Vercel / v0 | Geist | | Geist Mono |
| Cursor | CursorGothic | | Berkeley Mono |

- Three voices is the norm: a grotesk, a serif second voice, a mono for metadata.
- Weights are going lighter: Runway's display scale is all 400; Luma 500; Hedra 200. Only
  Vercel and Attio still set headlines semibold.
- Measured heroes: Vercel 64 px semibold −0.06em; Attio 64 to 80 px, line height 0.95; Luma
  52 px 500 −0.04em; Claude serif clamp(42 to 72 px) medium; Runway 48 to 80 px at 400,
  −0.02em, 1.05. Rule of thumb: sans headlines −0.02 to −0.04em; serif −0.01 to −0.02em.
- **Now read as AI fingerprints** (Hacker News "slop fonts", the Impeccable linter): Instrument
  Serif, Geist, Space Grotesk, Syne, Fraunces; an italic serif word in the headline; an
  uppercase eyebrow chip above the h1; purple gradients and gradient text; cards in cards.
  Montserrat, Poppins and Playfair Display read as 2018 templates.
- Free faces that still read premium: Inter with the `opsz` axis (at 32 it is Inter Display);
  Host Grotesk, Schibsted Grotesk, Hanken Grotesk; Switzer (Fontshare, closest to Suisse).
  Serif display: Newsreader at opsz 72 roman, Source Serif 4, Libre Caslon Display, Playfair 2
  (not Display), Gloock, Sentient. Mono: Fragment Mono, JetBrains Mono, IBM Plex Mono,
  Commit Mono.

## 3. Colour

- Both light and dark exist; the taste brands moved to **warm light** in 2025 to 2026: Pika's
  rebrand `#FAF8F4` on `#0D0D0D`; Claude `#FAF9F5` / `#141413`; Cursor `#F7F7F4`; ElevenLabs
  `#FDFCFC`; Granola `#FCFCF8`. Dark: Linear `#08090A`, Suno `#101012`, Raycast `#07080A`,
  Hedra `#0A0A0A` with bone `#F2F1ED` text. Nobody uses raw `#fff` on `#000`.
- **One accent, used sparingly:** Claude clay `#D97757`, Pika lavender `#806ECA`, Suno gold
  `#C4A670`, Granola lime `#D1E043`, Hedra coral `#F0614A`, Mintlify `#0C8C5E`. Luma and
  Runway use none.
- "Dark zinc + violet CTA + blue-to-purple gradient" is the recognised AI default. A coral
  primary with a radial glow (Aivia today) sits in the same generic zone.
- Creative tools let the generated media supply the colour: greyscale chrome, borderless
  media at 6 to 8 px radius, no shadows, media never on coloured cards, metadata on hover.

## 4. Motion

- Premium: one headline reveal on load (Linear blurs 10 px and lifts 20%; Pika masks lines
  with a `linear()` spring over 1.4 s, 60 ms stagger); muted looping hero media with posters
  and crossfades; hover-to-play cards (`preload="none"`, poster, 1.03 scale over 700 ms);
  strong ease-out everywhere (`cubic-bezier(.23,1,.32,1)` Pika and Raycast; `.22,1,.36,1`
  Cursor and Attio; `.32,.72,0,1` Linear and Vercel; `.16,1,.3,1` ElevenLabs); 220 ms for
  chrome, 300 to 700 ms for media; a slow logo marquee (65 s) that pauses on hover.
- CSS scroll-driven animation only as enhancement inside `@supports (animation-timeline:
  scroll())`. Lenis is optional (Pika, anthropic.com); Linear, Cursor and Vercel go without.
- Cheap: fade-up on every section (one or two tuned reveals per page), typewriter cycling
  words, cursor followers, magnetic buttons, 3D tilt cards, parallax everywhere, scroll-jacked
  pinned sequences, count-up stats, particle or blob backgrounds, glassmorphism, bouncy springs
  on chrome, fast marquees of generated images.

## 5. Imagery

- Formats: full-bleed crossfading hero loops; capability cards with hover-play output; an
  attributed gallery; before and after; process views (Flora's node canvas labelled with model
  names; Luma's "what's due this week" list of real jobs); a masonry wall (Sora at four to five
  16:9 tiles with a 16 px gutter).
- Curated: small sets of six or eight; one aspect ratio per row; one art direction per section;
  borderless 6 to 8 px frames; captions in small mono (prompt, model, render time); real-use
  subjects (product shots, posters, storyboards); posters plus `preload="none"`.
- Spammy: forty tiles of mixed styles and ratios; glossy faces, astronauts, neon cyberpunk;
  glows behind images; `rounded-3xl`; auto-scrolling rivers; no prompt or credit.

## 6. Directions considered

- **A. Editorial Studio.** Warm paper `#F6F4EF`, ink `#141413`, one accent; Newsreader roman
  headlines at 64 to 88 px with Inter body and a mono for captions; a serif statement beside a
  live plan card in the hero; outputs as captioned plates in a strict grid; one dark video
  band; motion limited to one headline reveal, the plan streaming in, hover-play plates.
  References: claude.com, Granola, Luma, Mintlify, Pika's palette.
- **B. Dark Cinema.** `#0A0A0A` stage, bone text, no accent; light grotesk at 72 to 84 px;
  full-bleed crossfading clips with a small headline. Lives or dies on cinema-grade footage.
- **C. Swiss Tool.** White, international orange, Inter Display semibold; a working prompt box
  as the h1; one faithful UI replica per capability. Reads "dev tool" more than "studio".
- **D. Soft Studio.** Cream, lavender, butter; wide uppercase Archivo with spring reveals.
  Pika's exact current look, so derivative.
- Recommendation from the research: A, with C's product-replica hero. Guardrails: roman serif
  never italic, no eyebrow chips, no gradient text, one accent, posters on hover-play media, a
  real dated changelog, a dense footer.
