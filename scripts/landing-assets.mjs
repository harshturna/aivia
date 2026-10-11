// Generates the landing page's media (TICKET-021, D-004): nature with scale, at first light.
// Run from the project root: `node --env-file=.env scripts/landing-assets.mjs <outdir> [still|clip|audio]`.
// Writes the originals; the page uses encoded copies in public/landing/ (stills resized to
// 1600 px JPEG for the image optimizer, clips 960 px h264 CRF 27 without audio, audio 128k
// MP3, fog plates turned into tileable alpha layers with their fades baked in). Prices: a
// flux-pro ultra still about $0.06, a wan 2.2 5b clip about $0.15, music and sound about $0.01.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fal } from "@fal-ai/client";

const OUT = process.argv[2] ?? "public/landing/src";
const only = process.argv[3];
mkdirSync(OUT, { recursive: true });
const save = async (name, url) =>
  writeFileSync(
    `${OUT}/${name}`,
    Buffer.from(await (await fetch(url)).arrayBuffer())
  );
const NO = "no buildings, no ruins, no castles, no people, no text";

const stills = [
  [
    "forest",
    "16:9",
    `Inside a colossal ancient forest at dawn, giant moss-covered trees rising like cathedral pillars, shafts of golden light falling through drifting mist, ferns on the forest floor, immense scale, awe, nature documentary photograph, ${NO}`,
  ],
  [
    "poster",
    "2:3",
    `Vertical nature poster artwork without lettering: one colossal ancient tree alone on a green hill above a sea of morning mist, a few birds circling, the low sun glowing behind its branches, painterly natural light, awe and calm, ${NO}`,
  ],
  [
    "canyon",
    "16:9",
    `Cinematic wide shot: a tall waterfall pours into a deep emerald pool in a green mossy canyon, ferns and hanging vines, mist rising from the water, shafts of morning sunlight, immense scale, nature documentary photograph, ${NO}`,
  ],
  [
    "valley",
    "16:9",
    `Vast untouched valley at first light seen from a high ridge: layers of forested mountains fading into soft blue distance, a slow river winding through a mist-filled valley floor, a tall thin waterfall falling from a cliff on the right, low golden sun rays breaking through morning mist, wild grasses in the near foreground, the upper third is open pale dawn sky, immense scale, awe, nature documentary photograph, ${NO}`,
  ],
  [
    "fog",
    "21:9",
    "Soft low-lying morning fog drifting horizontally, dense along the bottom and fading upward into thin wisps, white fog isolated on a pure black background, nothing else",
  ],
  [
    "owl",
    "3:4",
    `A snowy owl gliding low over a frozen lake at dawn, wings spread wide, soft pink and blue light, breath of mist over the ice, wildlife photograph, ${NO}`,
  ],
  [
    "dew",
    "1:1",
    `Macro photograph of a single dew drop hanging from a fern frond, the drop reflecting a sunrise forest upside down, shallow depth of field, soft green bokeh, ${NO}`,
  ],
  [
    "dunes",
    "3:4",
    `Sweeping desert dunes at blue hour, one line of footprints leading to the crest, a thin crescent moon above, soft sand ripples, vast and quiet, ${NO}`,
  ],
  [
    "ice",
    "3:4",
    `Inside a glacier ice cave, translucent blue walls rippled like water, sunlight glowing through the ice from above, immense and silent, ${NO}`,
  ],
  [
    "fox",
    "1:1",
    `A red fox curled asleep on deep green moss under falling autumn leaves, soft morning forest light, wildlife photograph, ${NO}`,
  ],
  [
    "whale",
    "3:4",
    `Painterly storybook illustration of a giant whale swimming through soft clouds above a mountain range at sunset, tiny birds alongside, warm gold and rose light, gouache texture, ${NO}`,
  ],
  [
    "hummingbird",
    "1:1",
    `A hummingbird hovering at a red trumpet flower, wings frozen mid-beat, deep green blurred background, high speed nature photograph, ${NO}`,
  ],
  [
    "kelp",
    "16:9",
    `Sunlight streaming down through a towering kelp forest underwater, a harbour seal gliding between the golden fronds, deep teal water, immense scale, ${NO}`,
  ],
  [
    "mushrooms",
    "1:1",
    `Tiny bioluminescent mushrooms glowing softly in dark moss at night in an old forest, faint mist, macro photograph, magical and quiet, ${NO}`,
  ],
  [
    "aurora",
    "16:9",
    `Green and violet aurora rippling over a still fjord at night, snowy mountains mirrored in the black water, stars, vast and silent, landscape photograph, ${NO}`,
  ],
];
// image-to-video from the still of the same name; a locked-off camera so the 5 s loop is seamless
const clips = [
  [
    "canyon",
    "Static locked-off camera, the waterfall pours steadily into the emerald pool, mist rises and drifts, ripples spread across the water, shafts of sunlight shimmer, leaves sway gently, calm and majestic, no camera movement",
  ],
  [
    "valley",
    "Static locked-off camera, morning mist drifts slowly along the valley floor, the waterfall falls steadily, sun rays shimmer softly, grasses in the foreground sway in a light breeze, calm and majestic, no camera movement",
  ],
  [
    "aurora",
    "Static locked-off camera, the aurora ripples and flows slowly across the sky, its reflection shimmers on the still water, stars twinkle, calm and majestic, no camera movement",
  ],
];

if (!only || only === "still")
  await Promise.all(
    stills
      .filter(([n]) => !existsSync(`${OUT}/${n}.jpg`))
      .map(async ([name, aspect_ratio, prompt]) => {
        const r = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
          input: {
            prompt,
            aspect_ratio,
            output_format: "jpeg",
            safety_tolerance: "2",
          },
        });
        await save(`${name}.jpg`, r.data.images[0].url);
        writeFileSync(`${OUT}/${name}.url`, r.data.images[0].url);
        console.log("still", name);
      })
  );
if (!only || only === "clip")
  await Promise.all(
    clips
      .filter(([n]) => !existsSync(`${OUT}/${n}.mp4`))
      .map(async ([name, prompt]) => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const r = await fal.subscribe("fal-ai/wan/v2.2-5b/image-to-video", {
              input: {
                image_url: readFileSync(`${OUT}/${name}.url`, "utf8").trim(),
                prompt,
                resolution: "720p",
                aspect_ratio: "16:9",
                num_frames: 121,
                frames_per_second: 24,
              },
            });
            await save(`${name}.mp4`, r.data.video.url);
            console.log("clip", name);
            return;
          } catch (error) {
            console.log("clip", name, "attempt", attempt, error?.message);
          }
        }
      })
  );
if (!only || only === "audio") {
  const m = await fal.subscribe("cassetteai/music-generator", {
    input: {
      prompt:
        "slow awe-inspiring ambient orchestral piece, soft choir pads, warm low strings, distant bells, harp, dawn, wonder, 70 bpm, instrumental",
      duration: 30,
    },
  });
  await save(
    "score.mp3",
    m.data?.audio_file?.url ?? m.data?.audio?.url ?? m.data?.url
  );
  const s = await fal.subscribe("fal-ai/elevenlabs/sound-effects/v2", {
    input: {
      text: "dawn chorus in an old forest, songbirds near and far, a small stream trickling, soft breeze in leaves, no voices",
      duration_seconds: 12,
    },
  });
  await save("birdsong.mp3", s.data?.audio?.url ?? s.data?.url);
  console.log("audio done");
}
