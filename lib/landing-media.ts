/**
 * The landing page's media (TICKET-021, D-004): every file was made with the app's own
 * models from the prompt beside it (stills on flux-pro ultra, clips as image-to-video loops,
 * the score and the sound on the music and sound models), then encoded into public/landing/.
 * The wall, the modes and the run demo read from here so a caption never drifts from its file.
 */
export type LandingClip = {
  kind: "video";
  src: string;
  poster: string;
  prompt: string;
};
export type LandingStill = {
  kind: "image";
  src: string;
  prompt: string;
  width: number;
  height: number;
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
    src: "/landing/canyon.mp4",
    poster: "/landing/canyon-poster.webp",
    prompt:
      "a tall waterfall pouring into an emerald pool in a mossy canyon, mist and morning light",
  },
  {
    kind: "video",
    src: "/landing/aurora.mp4",
    poster: "/landing/aurora-poster.webp",
    prompt:
      "green and violet aurora over a still fjord, the mountains mirrored",
  },
  {
    kind: "video",
    src: "/landing/valley.mp4",
    poster: "/landing/valley-poster.webp",
    prompt:
      "mist drifting along a valley at first light, a waterfall on the cliff",
  },
];

export const STILLS: LandingStill[] = [
  {
    kind: "image",
    src: "/landing/tree.jpg",
    prompt: "one ancient tree alone on a hill above a sea of morning mist",
    width: 1200,
    height: 1800,
  },
  {
    kind: "image",
    src: "/landing/owl.jpg",
    prompt: "a snowy owl gliding low over a frozen lake at dawn",
    width: 1211,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/whale.jpg",
    prompt:
      "a whale swimming through clouds above the mountains, storybook gouache",
    width: 1211,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/dunes.jpg",
    prompt:
      "desert dunes at blue hour, one line of footprints, a crescent moon",
    width: 1211,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/ice.jpg",
    prompt:
      "inside a glacier ice cave, sunlight glowing through the blue walls",
    width: 1211,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/dew.jpg",
    prompt: "one dew drop on a fern, the sunrise forest inside it",
    width: 1600,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/fox.jpg",
    prompt: "a red fox asleep on moss under falling autumn leaves",
    width: 1600,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/hummingbird.jpg",
    prompt: "a hummingbird at a red flower, wings frozen mid-beat",
    width: 1600,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/mushrooms.jpg",
    prompt: "tiny glowing mushrooms in dark moss at night",
    width: 1600,
    height: 1600,
  },
  {
    kind: "image",
    src: "/landing/kelp.jpg",
    prompt: "sunlight through a kelp forest, a seal gliding between the fronds",
    width: 1600,
    height: 893,
  },
];

export const TRACKS: LandingTrack[] = [
  {
    kind: "music",
    src: "/landing/score.mp3",
    title: "First light in the old wood",
    prompt: "slow ambient strings, soft choir, distant bells and harp",
    seconds: 30,
  },
  {
    kind: "sound",
    src: "/landing/birdsong.mp3",
    title: "Dawn chorus by a stream",
    prompt: "songbirds near and far, a small stream, wind in the leaves",
    seconds: 12,
  },
];
