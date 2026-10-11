/**
 * The landing page's media (TICKET-012): every file was made with the app's own models from
 * the prompt shown beside it, then re-encoded into public/landing/. The wall and the plates
 * read from here so a caption is never out of step with its file.
 */
export type LandingClip = {
  kind: "video";
  src: string;
  poster: string;
  prompt: string;
  seconds: number;
};
export type LandingStill = {
  kind: "image";
  src: string;
  prompt: string;
  width: number;
  height: number;
  seconds: number;
};
export type LandingTrack = {
  kind: "music" | "sound";
  src: string;
  title: string;
  prompt: string;
  seconds: number;
};

export const CLIPS: LandingClip[] = [
  {
    kind: "video",
    src: "/landing/alley.mp4",
    poster: "/landing/alley-poster.webp",
    prompt:
      "a slow dolly through a narrow night market alley after rain, paper lanterns, steam from a stall",
    seconds: 5,
  },
  {
    kind: "video",
    src: "/landing/ink.mp4",
    poster: "/landing/ink-poster.webp",
    prompt: "black ink unfurling slowly in clear water, one soft side light",
    seconds: 5,
  },
  {
    kind: "video",
    src: "/landing/sea.mp4",
    poster: "/landing/sea-poster.webp",
    prompt: "a calm dark sea at dusk from straight above, slow drift",
    seconds: 5,
  },
];

export const STILLS: LandingStill[] = [
  {
    kind: "image",
    src: "/landing/lanterns.webp",
    prompt: "paper lanterns over a wet night market alley, 35mm",
    width: 768,
    height: 1024,
    seconds: 8,
  },
  {
    kind: "image",
    src: "/landing/citrus.webp",
    prompt:
      "halved blood oranges and a lemon on dark slate, one hard side light",
    width: 1024,
    height: 1024,
    seconds: 7,
  },
  {
    kind: "image",
    src: "/landing/vase.webp",
    prompt: "a matte black vase with pampas grass under a single spotlight",
    width: 768,
    height: 1024,
    seconds: 6,
  },
  {
    kind: "image",
    src: "/landing/stair.webp",
    prompt: "a brutalist spiral staircase in late afternoon light",
    width: 832,
    height: 1024,
    seconds: 7,
  },
  {
    kind: "image",
    src: "/landing/moto.webp",
    prompt: "a cafe racer in a dark garage under one warm bulb",
    width: 1024,
    height: 576,
    seconds: 6,
  },
  {
    kind: "image",
    src: "/landing/indigo.webp",
    prompt: "hand-woven indigo cloth with one stray thread",
    width: 1024,
    height: 1024,
    seconds: 6,
  },
  {
    kind: "image",
    src: "/landing/espresso.webp",
    prompt: "espresso pouring into a cup on a dark counter, warm light",
    width: 768,
    height: 1024,
    seconds: 7,
  },
  {
    kind: "image",
    src: "/landing/cup.webp",
    prompt: "a ceramic cup on raw linen in raking morning light",
    width: 1024,
    height: 1024,
    seconds: 8,
  },
  {
    kind: "image",
    src: "/landing/rain-window.webp",
    prompt: "rain running down a window at dusk, city lights beyond",
    width: 1024,
    height: 576,
    seconds: 6,
  },
  {
    kind: "image",
    src: "/landing/paper.webp",
    prompt: "three sheets of handmade paper folded over one another",
    width: 1024,
    height: 768,
    seconds: 6,
  },
];

export const TRACKS: LandingTrack[] = [
  {
    kind: "music",
    src: "/landing/lofi.mp3",
    title: "Night market lo-fi",
    prompt: "warm lo-fi hip hop, brushed drums, soft keys, distant rain",
    seconds: 30,
  },
  {
    kind: "sound",
    src: "/landing/rain.mp3",
    title: "Rain on a tin roof",
    prompt: "steady rain on a tin roof, close, no wind",
    seconds: 10,
  },
];
