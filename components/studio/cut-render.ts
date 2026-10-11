import { alphaAt, CUT, type CutPieces, planCut, type Segment } from "@/lib/cut";

/**
 * Draws and encodes a cut in the browser (TICKET-040) with WebCodecs through mediabunny,
 * which is loaded only here, when someone renders. MP4 (H.264 and AAC) where the browser
 * encodes it, WebM (VP9 and Opus) otherwise. Nothing leaves the browser.
 */
export type Rendered = {
  blob: Blob;
  ext: "mp4" | "webm";
  width: number;
  height: number;
  seconds: number;
};

const MAX_EDGE = 1280;

function even(n: number) {
  return Math.max(2, Math.round(n / 2) * 2);
}

function fitSize(w: number, h: number) {
  const s = Math.min(1, MAX_EDGE / Math.max(w, h));
  return { width: even(w * s), height: even(h * s) };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read a still for the cut"));
    img.src = url;
  });
}

/** The score, fitted to the cut: faded in, held, faded out at the end. */
async function fitTrack(url: string, seconds: number) {
  const rate = 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * rate), rate);
  const data = await (await fetch(url)).arrayBuffer();
  const buffer = await ctx.decodeAudioData(data);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(1, 0.4);
  gain.gain.setValueAtTime(1, Math.max(0.5, seconds - 1.6));
  gain.gain.linearRampToValueAtTime(0, seconds);
  source.connect(gain).connect(ctx.destination);
  source.start(0);
  return ctx.startRendering();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  w: number,
  h: number,
  zoom = 1
) {
  const s = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderCut(
  all: CutPieces,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<Rendered> {
  // browsers offer their video encoder only on a secure page: over plain http on a network
  // address it is missing, whatever the browser (TICKET-059)
  if (!window.isSecureContext)
    throw new Error(
      "Cutting needs a secure page. Open Aivia over https, or on localhost, and try again."
    );
  const mb = await import("mediabunny");
  // the stills it draws are the stills it plans: six at most (TICKET-043)
  const pieces = { ...all, stills: all.stills.slice(0, 6) };

  const clips = await Promise.all(
    pieces.clips.map(async (url) => {
      const input = new mb.Input({
        source: new mb.UrlSource(url),
        formats: mb.ALL_FORMATS,
      });
      const track = await input.getPrimaryVideoTrack();
      if (!track) throw new Error("A clip has no picture");
      // the picture's length, not the longer of picture and sound
      return { track, seconds: await track.computeDuration() };
    })
  );
  const stills = new Map<string, HTMLImageElement>();
  await Promise.all(
    pieces.stills.map(async (s) => {
      stills.set(s.url, await loadImage(s.url));
    })
  );

  const first = clips[0]?.track;
  // the first still decides the shape, whichever image happened to load first
  const firstStill = pieces.stills[0] && stills.get(pieces.stills[0].url);
  const { width, height } = first
    ? fitSize(first.displayWidth, first.displayHeight)
    : fitSize(firstStill?.width ?? 1280, firstStill?.height ?? 720);
  const { segments, duration } = planCut(
    pieces,
    clips.map((c) => c.seconds)
  );
  const sinks = clips.map(
    (c) =>
      new mb.CanvasSink(c.track, { width, height, fit: "cover", poolSize: 2 })
  );

  // sound is only checked when there is sound: a silent cut needs no audio encoder
  const sound = Boolean(pieces.track);
  const mp4 =
    (await mb.canEncodeVideo("avc", { width, height })) &&
    (!sound || (await mb.canEncodeAudio("aac")));
  const webm =
    !mp4 &&
    (await mb.canEncodeVideo("vp9", { width, height })) &&
    (!sound || (await mb.canEncodeAudio("opus")));
  if (!mp4 && !webm)
    throw new Error(
      "This browser cannot encode video. Try a recent Chrome, Edge or Safari."
    );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the cut");

  const css = getComputedStyle(document.documentElement);
  const bg = css.getPropertyValue("--color-bg").trim() || "#0e0e0d";
  const fg = css.getPropertyValue("--color-fg").trim() || "#f1ecdc";
  const family =
    css.getPropertyValue("--font-cormorant").trim() || "Georgia, serif";
  const size = Math.round(height * 0.09);
  await document.fonts.load(`500 ${size}px ${family}`).catch(() => {});

  const target = new mb.BufferTarget();
  const output = new mb.Output({
    format: mp4
      ? new mb.Mp4OutputFormat({ fastStart: "in-memory" })
      : new mb.WebMOutputFormat(),
    target,
  });
  const video = new mb.CanvasSource(canvas, {
    codec: mp4 ? "avc" : "vp9",
    // about 2.5 Mbps: a 10 s cut stays well under what the library can keep (TICKET-042)
    bitrate: 2_500_000,
  });
  output.addVideoTrack(video, { frameRate: CUT.fps });
  const audio = pieces.track
    ? new mb.AudioBufferSource({
        codec: mp4 ? "aac" : "opus",
        bitrate: mb.QUALITY_MEDIUM,
      })
    : null;
  if (audio) output.addAudioTrack(audio);
  const fitted = pieces.track
    ? await fitTrack(pieces.track.url, duration)
    : null;
  await output.start();

  const text = (s: Segment, words: string, y: number) => {
    ctx.font = `500 ${s.kind === "title" ? size : Math.round(size * 0.78)}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = fg;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = size * 0.6;
    const lines = wrap(ctx, words, width * 0.78);
    const lh = (s.kind === "title" ? size : size * 0.78) * 1.15;
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, y + (i - (lines.length - 1) / 2) * lh);
    });
    ctx.shadowBlur = 0;
  };

  const frames = Math.max(1, Math.round(duration * CUT.fps));
  for (let f = 0; f < frames; f++) {
    if (signal?.aborted) {
      await output.cancel();
      throw new DOMException("The cut was cancelled", "AbortError");
    }
    const t = f / CUT.fps;
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    for (const s of segments) {
      const a = alphaAt(s, t);
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      if (s.kind === "clip" && s.clip !== undefined) {
        const local = Math.min(
          Math.max(0, t - s.start),
          clips[s.clip].seconds - 1 / CUT.fps
        );
        const frame = await sinks[s.clip].getCanvas(local);
        if (frame) ctx.drawImage(frame.canvas, 0, 0, width, height);
      } else if (s.kind === "still" && s.src) {
        const img = stills.get(s.src);
        if (img) {
          const k = (t - s.start) / (s.end - s.start);
          const [z0, z1] = s.zoom ?? [1, 1];
          drawCover(ctx, img, width, height, z0 + (z1 - z0) * k);
        }
        if (s.text) {
          const g = ctx.createLinearGradient(0, height * 0.55, 0, height);
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(1, "rgba(0,0,0,0.65)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, width, height);
          text(s, s.text, height * 0.84);
        }
      } else if (s.kind === "title" && s.text) {
        text(s, s.text, height / 2);
      }
    }
    await video.add(t, 1 / CUT.fps);
    if (f % 6 === 0) onProgress(f / frames);
  }
  if (audio && fitted) await audio.add(fitted);
  await output.finalize();
  onProgress(1);
  const buffer = target.buffer;
  if (!buffer) throw new Error("The cut came out empty");
  return {
    blob: new Blob([buffer], { type: mp4 ? "video/mp4" : "video/webm" }),
    ext: mp4 ? "mp4" : "webm",
    width,
    height,
    seconds: duration,
  };
}
