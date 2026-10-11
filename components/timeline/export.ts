import { gainEnvelope, layersAt } from "@/lib/timeline/layout";
import { docDuration, type TimelineDoc } from "@/lib/timeline/schema";
import { drawFrame, type Resolved, readTheme, titleSize } from "./compositor";

/**
 * Renders a cut to a file in the browser (TICKET-061), with WebCodecs through mediabunny,
 * loaded only when someone exports. Every frame comes from `layersAt` and `drawFrame`, the
 * same two functions the player uses. MP4 (H.264 and AAC) where the browser can make it, with
 * a bundled AAC encoder where only the audio half is missing; WebM (VP9 and Opus) otherwise.
 * Nothing leaves the browser.
 */
export type Rendered = {
  blob: Blob;
  ext: "mp4" | "webm";
  width: number;
  height: number;
  seconds: number;
};

type Mb = typeof import("mediabunny");

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read a still for the cut"));
    img.src = url;
  });
}

/** Browsers offer their encoder only on a secure page (TICKET-059). */
function requireSecure() {
  if (!window.isSecureContext)
    throw new Error(
      "Cutting needs a secure page. Open Aivia over https, or on localhost, and try again."
    );
}

/** A clip's picture: its size and its length (the picture's, not the longer sound's). */
export async function probeVideo(url: string) {
  requireSecure();
  const mb = await import("mediabunny");
  const input = new mb.Input({
    source: new mb.UrlSource(url),
    formats: mb.ALL_FORMATS,
  });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("A clip has no picture");
  return {
    width: track.displayWidth,
    height: track.displayHeight,
    durationMs: Math.round((await track.computeDuration()) * 1000),
  };
}

/** The best format this browser can write, loading the AAC encoder only if it is needed. */
async function chooseFormat(
  mb: Mb,
  width: number,
  height: number,
  sound: boolean
) {
  const avc = await mb.canEncodeVideo("avc", { width, height });
  let aac = !sound || (await mb.canEncodeAudio("aac"));
  if (avc && !aac) {
    // older Safari encodes H.264 but not AAC: a small WebAssembly encoder fills the gap
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
    aac = await mb.canEncodeAudio("aac");
  }
  if (avc && aac) return "mp4" as const;
  const vp9 = await mb.canEncodeVideo("vp9", { width, height });
  const opus = !sound || (await mb.canEncodeAudio("opus"));
  if (vp9 && opus) return "webm" as const;
  throw new Error(
    "This browser cannot encode video. Try a recent Chrome, Edge or Safari."
  );
}

/** Every audio item mixed to one buffer, each at its place, trim and fades. */
async function mixAudio(doc: TimelineDoc, seconds: number) {
  const items = doc.tracks.flatMap((t) => (t.kind === "audio" ? t.items : []));
  if (!items.length) return null;
  const rate = 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * rate), rate);
  const decoded = new Map<string, AudioBuffer>();
  for (const item of items) {
    const media = doc.media[item.media];
    if (!media) continue;
    let buffer = decoded.get(item.media);
    if (!buffer) {
      buffer = await ctx.decodeAudioData(
        await (await fetch(media.url)).arrayBuffer()
      );
      decoded.set(item.media, buffer);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const points = gainEnvelope(item);
    gain.gain.setValueAtTime(points[0][1], points[0][0] / 1000);
    for (const [ms, g] of points.slice(1))
      gain.gain.linearRampToValueAtTime(g, ms / 1000);
    source.connect(gain).connect(ctx.destination);
    source.start(item.start / 1000, item.in / 1000, item.duration / 1000);
  }
  return ctx.startRendering();
}

export async function renderTimeline(
  doc: TimelineDoc,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<Rendered> {
  requireSecure();
  const mb = await import("mediabunny");
  const { width, height, fps } = doc;
  const durationMs = docDuration(doc);
  if (durationMs <= 0) throw new Error("There is nothing in this cut yet");

  // each picture opened once: clips as frame sinks at the cut's size, stills as images
  const sinks = new Map<string, InstanceType<Mb["CanvasSink"]>>();
  const images = new Map<string, HTMLImageElement>();
  await Promise.all(
    Object.entries(doc.media).map(async ([key, media]) => {
      if (media.kind === "video") {
        const input = new mb.Input({
          source: new mb.UrlSource(media.url),
          formats: mb.ALL_FORMATS,
        });
        const track = await input.getPrimaryVideoTrack();
        if (!track) throw new Error("A clip has no picture");
        sinks.set(
          key,
          new mb.CanvasSink(track, { width, height, fit: "cover", poolSize: 2 })
        );
      } else if (media.kind === "image") {
        images.set(key, await loadImage(media.url));
      }
    })
  );

  const sound = doc.tracks.some(
    (t) => t.kind === "audio" && t.items.length > 0
  );
  const format = await chooseFormat(mb, width, height, sound);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the cut");
  const theme = readTheme();
  await document.fonts
    .load(`500 ${titleSize(height)}px ${theme.family}`)
    .catch(() => {});

  const target = new mb.BufferTarget();
  const output = new mb.Output({
    format:
      format === "mp4"
        ? new mb.Mp4OutputFormat({ fastStart: "in-memory" })
        : new mb.WebMOutputFormat(),
    target,
  });
  const video = new mb.CanvasSource(canvas, {
    codec: format === "mp4" ? "avc" : "vp9",
    // about 2.5 Mbps at 720p
    bitrate: 2_500_000,
  });
  output.addVideoTrack(video, { frameRate: fps });
  const audio = sound
    ? new mb.AudioBufferSource({
        codec: format === "mp4" ? "aac" : "opus",
        bitrate: mb.QUALITY_MEDIUM,
      })
    : null;
  if (audio) output.addAudioTrack(audio);
  const mixed = sound ? await mixAudio(doc, durationMs / 1000) : null;
  await output.start();

  const frames = Math.max(1, Math.round((durationMs / 1000) * fps));
  for (let f = 0; f < frames; f++) {
    if (signal?.aborted) {
      await output.cancel();
      throw new DOMException("The cut was cancelled", "AbortError");
    }
    const t = f / fps;
    const layers = layersAt(doc, Math.round(t * 1000));
    const resolved: Resolved[] = [];
    for (const layer of layers) {
      if (layer.kind === "video") {
        const frame = await sinks
          .get(layer.item.media)
          ?.getCanvas(layer.sourceMs / 1000);
        resolved.push({ layer, picture: frame?.canvas ?? null });
      } else if (layer.kind === "image") {
        resolved.push({ layer, picture: images.get(layer.item.media) ?? null });
      } else resolved.push({ layer });
    }
    drawFrame(ctx, width, height, resolved, theme);
    await video.add(t, 1 / fps);
    if (f % 6 === 0) onProgress(f / frames);
  }
  if (audio && mixed) await audio.add(mixed);
  await output.finalize();
  onProgress(1);
  const buffer = target.buffer;
  if (!buffer) throw new Error("The cut came out empty");
  return {
    blob: new Blob([buffer], {
      type: format === "mp4" ? "video/mp4" : "video/webm",
    }),
    ext: format,
    width,
    height,
    seconds: durationMs / 1000,
  };
}
