// Generates the landing page's media with the app's own models (TICKET-012). Run from the
// project root with `node --env-file=.env scripts/landing-assets.mjs <outdir>`. Writes the
// originals; the page uses re-encoded copies under public/landing/. Prices in
// lib/ai/capabilities.ts: a 6 s clip about $0.24, an image about $0.025, audio about $0.01.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fal } from "@fal-ai/client";

const OUT = process.argv[2] ?? "public/landing/src";
mkdirSync(OUT, { recursive: true });
const save = async (name, url) => {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`${OUT}/${name}`, buf);
  return Math.round(buf.length / 1024);
};
const only = process.argv[3]; // "video" | "image" | "audio" to run one kind

const videos = [
  [
    "alley",
    "Slow forward dolly through a narrow night market alley after rain at night, paper lanterns glowing warm amber, steam drifting from a food stall, reflections on wet stone, cinematic 35mm, shallow depth of field, soft film grain, no people in focus, no text",
  ],
  [
    "ink",
    "Extreme macro of black ink unfurling slowly in clear water against a pure black background, one soft side light catching the edges, slow motion, cinematic, no text",
  ],
  [
    "sea",
    "Aerial view straight down onto a calm dark sea at dusk, slow steady drift, soft last light on gentle swells, muted blue and graphite tones, cinematic, no text",
  ],
];
const images = [
  [
    "citrus",
    { width: 1024, height: 1024 },
    "Still life of halved blood oranges and a lemon on dark slate, one hard side light, deep chiaroscuro shadows, fine film grain, no text",
  ],
  [
    "vase",
    { width: 768, height: 1024 },
    "A tall matte black ceramic vase with dried pampas grass in a dark studio, a single soft spotlight from the upper left, deep shadow, medium format, no text",
  ],
  [
    "stair",
    { width: 832, height: 1024 },
    "Brutalist concrete spiral staircase in strong late-afternoon light, long hard shadows, high contrast, warm concrete tones, architectural photograph, no text",
  ],
  [
    "moto",
    { width: 1024, height: 576 },
    "A vintage cafe racer motorcycle in a dark garage lit by one warm hanging bulb, chrome catching the light, cinematic 50mm, shallow depth of field, no text",
  ],
  [
    "indigo",
    { width: 1024, height: 1024 },
    "Close-up of hand-woven indigo textile with one stray pale thread, soft raking light, visible weave, quiet composition, no text",
  ],
  [
    "espresso",
    { width: 768, height: 1024 },
    "Espresso pouring into a small ceramic cup on a dark counter, warm tungsten light, a wisp of steam, 85mm, shallow depth of field, no text",
  ],
];

if (!only || only === "video")
  for (const [name, prompt] of videos) {
    if (existsSync(`${OUT}/${name}.mp4`)) continue;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const t = Date.now();
      try {
        // generate_audio off: the clips play muted and the audio doubled the failure rate
        const r = await fal.subscribe("fal-ai/ltx-2/text-to-video/fast", {
          input: {
            prompt,
            duration: 6,
            resolution: "1080p",
            generate_audio: false,
          },
        });
        const url = r.data?.video?.url ?? r.data?.url;
        console.log(
          "video",
          name,
          (await save(`${name}.mp4`, url)) + "KB",
          ((Date.now() - t) / 1000).toFixed(0) + "s"
        );
        break;
      } catch (error) {
        console.log(
          "video",
          name,
          "attempt",
          attempt,
          "failed:",
          error?.body?.detail?.[0]?.msg ?? error?.message
        );
        if (attempt === 3) console.log("video", name, "given up");
      }
    }
  }
if (!only || only === "image")
  for (const [name, image_size, prompt] of images) {
    const r = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt,
        image_size,
        num_images: 1,
        output_format: "jpeg",
        guidance_scale: 3.5,
        num_inference_steps: 28,
      },
    });
    console.log(
      "image",
      name,
      (await save(`${name}.jpg`, r.data.images[0].url)) + "KB"
    );
  }
if (!only || only === "audio") {
  const m = await fal.subscribe("cassetteai/music-generator", {
    input: {
      prompt:
        "warm lo-fi hip hop, brushed drums, soft Rhodes keys, distant rain, 80 bpm, instrumental, mellow",
      duration: 30,
    },
  });
  console.log(
    "music",
    (await save(
      "lofi.mp3",
      m.data?.audio_file?.url ?? m.data?.audio?.url ?? m.data?.url
    )) + "KB"
  );
  const s = await fal.subscribe("fal-ai/elevenlabs/sound-effects/v2", {
    input: {
      text: "steady rain falling on a tin roof, close, no wind, no thunder",
      duration_seconds: 10,
    },
  });
  console.log(
    "sfx",
    (await save("rain.mp3", s.data?.audio?.url ?? s.data?.url)) + "KB"
  );
}
