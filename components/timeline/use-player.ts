"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { layersAt } from "@/lib/timeline/layout";
import { docDuration, type TimelineDoc } from "@/lib/timeline/schema";
import { drawFrame, type Resolved, readTheme, titleSize } from "./compositor";
import { mixAudio } from "./export";

/**
 * The player behind the Cut view (D-005 §17.6, TICKET-065). It draws with the same `layersAt`
 * and `drawFrame` as export, so the preview is the film. Paused, it decodes the one frame each
 * visible clip shows; playing, each clip on screen has its own frame iterator, read against an
 * AudioContext clock that also plays the cut's sound, pre-mixed by the export's own mixer.
 */
type Mb = typeof import("mediabunny");
type Sink = InstanceType<Mb["CanvasSink"]>;
type Frame = { canvas: HTMLCanvasElement | OffscreenCanvas; timestamp: number };

/** One clip's frames while playing: the next one fetched ahead, the current one held. */
class Puller {
  private iter: AsyncGenerator<Frame, void, unknown>;
  private ahead: Frame | null = null;
  private current: Frame | null = null;
  private filling = false;
  private done = false;
  constructor(sink: Sink, fromSec: number) {
    this.iter = sink.canvases(fromSec) as AsyncGenerator<Frame, void, unknown>;
    void this.fill();
  }
  private async fill() {
    if (this.filling || this.done || this.ahead) return;
    this.filling = true;
    const r = await this.iter
      .next()
      .catch(() => ({ done: true, value: undefined }));
    this.filling = false;
    if (r.done || !r.value) this.done = true;
    else this.ahead = r.value as Frame;
  }
  /** The latest frame at or before `sec`, asking for the next one as it goes. */
  at(sec: number) {
    if (this.ahead && this.ahead.timestamp <= sec + 0.001) {
      this.current = this.ahead;
      this.ahead = null;
    }
    void this.fill();
    return this.current?.canvas ?? null;
  }
  stop() {
    this.done = true;
    void this.iter.return?.(undefined);
  }
}

export function usePlayer(
  doc: TimelineDoc,
  canvas: React.RefObject<HTMLCanvasElement | null>
) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const docRef = useRef(doc);
  docRef.current = doc;
  const timeRef = useRef(0);
  /** Listeners that move with the clock every frame (the timeline's playhead). */
  const listeners = useRef(new Set<(ms: number) => void>());

  const mb = useRef<Mb | null>(null);
  const sinks = useRef(new Map<string, Promise<Sink | null>>());
  const images = useRef(new Map<string, Promise<HTMLImageElement | null>>());
  const pullers = useRef(new Map<string, Puller>());
  const audio = useRef<{
    ctx: AudioContext;
    source?: AudioBufferSourceNode;
    startedAt: number;
  } | null>(null);
  const mixes = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const raf = useRef(0);
  const drawing = useRef(0);

  const sinkFor = useCallback((key: string) => {
    const media = docRef.current.media[key];
    if (!media) return Promise.resolve(null);
    const id = `${media.url}@${docRef.current.width}x${docRef.current.height}`;
    let p = sinks.current.get(id);
    if (!p) {
      p = (async () => {
        try {
          mb.current ??= await import("mediabunny");
          const m = mb.current;
          const input = new m.Input({
            source: new m.UrlSource(media.url),
            formats: m.ALL_FORMATS,
          });
          const track = await input.getPrimaryVideoTrack();
          if (!track) return null;
          return new m.CanvasSink(track, {
            width: docRef.current.width,
            height: docRef.current.height,
            fit: "cover",
          });
        } catch {
          return null;
        }
      })();
      sinks.current.set(id, p);
    }
    return p;
  }, []);

  const imageFor = useCallback((key: string) => {
    const media = docRef.current.media[key];
    if (!media) return Promise.resolve(null);
    let p = images.current.get(media.url);
    if (!p) {
      p = new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = media.url;
      });
      images.current.set(media.url, p);
    }
    return p;
  }, []);

  const paint = useCallback(
    async (ms: number, live: boolean) => {
      const el = canvas.current;
      const ctx = el?.getContext("2d");
      if (!el || !ctx) return;
      const d = docRef.current;
      if (el.width !== d.width || el.height !== d.height) {
        el.width = d.width;
        el.height = d.height;
      }
      const ticket = ++drawing.current;
      const layers = layersAt(d, ms);
      const resolved: Resolved[] = [];
      const active = new Set<string>();
      for (const layer of layers) {
        if (layer.kind === "video") {
          const sec = layer.sourceMs / 1000;
          let picture: CanvasImageSource | null = null;
          if (live) {
            active.add(layer.item.id);
            let puller = pullers.current.get(layer.item.id);
            if (!puller) {
              const sink = await sinkFor(layer.item.media);
              if (sink) {
                puller = new Puller(sink, sec);
                pullers.current.set(layer.item.id, puller);
              }
            }
            picture = puller?.at(sec) ?? null;
          } else {
            const sink = await sinkFor(layer.item.media);
            picture =
              (await sink?.getCanvas(sec).catch(() => null))?.canvas ?? null;
          }
          resolved.push({ layer, picture });
        } else if (layer.kind === "image") {
          resolved.push({ layer, picture: await imageFor(layer.item.media) });
        } else resolved.push({ layer });
      }
      if (live)
        for (const [id, p] of pullers.current)
          if (!active.has(id)) {
            p.stop();
            pullers.current.delete(id);
          }
      // a newer frame was asked for while this one decoded: let it draw instead
      if (ticket !== drawing.current) return;
      drawFrame(ctx, d.width, d.height, resolved, readTheme());
    },
    [canvas, sinkFor, imageFor]
  );

  const stopPullers = () => {
    for (const p of pullers.current.values()) p.stop();
    pullers.current.clear();
  };

  const tell = (ms: number) => {
    timeRef.current = ms;
    for (const f of listeners.current) f(ms);
  };

  const pause = useCallback(() => {
    cancelAnimationFrame(raf.current);
    audio.current?.source?.stop();
    if (audio.current) audio.current.source = undefined;
    stopPullers();
    setPlaying(false);
    setTime(timeRef.current);
    void paint(timeRef.current, false);
  }, [paint]);

  const seek = useCallback(
    (ms: number) => {
      const length = docDuration(docRef.current);
      const t = Math.max(0, Math.min(ms, length));
      if (playing) pause();
      tell(t);
      setTime(t);
      void paint(t, false);
    },
    [paint, pause, playing]
  );

  const play = useCallback(async () => {
    const d = docRef.current;
    const length = docDuration(d);
    if (length <= 0) return;
    let from = timeRef.current >= length - 50 ? 0 : timeRef.current;
    audio.current ??= { ctx: new AudioContext(), startedAt: 0 };
    const a = audio.current;
    await a.ctx.resume();
    // the cut's sound, mixed once per version of the cut
    const key = JSON.stringify([
      d.media,
      d.tracks.filter((t) => t.kind === "audio"),
    ]);
    let mix = mixes.current.get(key);
    if (!mix) {
      mix = mixAudio(d, length / 1000).catch(() => null);
      mixes.current.set(key, mix);
    }
    setLoading(true);
    const buffer = await mix;
    setLoading(false);
    from = timeRef.current >= length - 50 ? 0 : timeRef.current;
    a.startedAt = a.ctx.currentTime - from / 1000;
    if (buffer) {
      const source = a.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(a.ctx.destination);
      source.start(0, from / 1000);
      a.source = source;
    }
    setPlaying(true);
    let lastState = 0;
    const tick = () => {
      const now = (a.ctx.currentTime - a.startedAt) * 1000;
      if (now >= length) {
        tell(length);
        pause();
        return;
      }
      tell(now);
      if (performance.now() - lastState > 120) {
        lastState = performance.now();
        setTime(now);
      }
      void paint(now, true);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [paint, pause]);

  // the picture follows every edit while paused
  // biome-ignore lint/correctness/useExhaustiveDependencies: redraw when the cut changes
  useEffect(() => {
    if (!playing)
      void paint(Math.min(timeRef.current, docDuration(doc)), false);
  }, [doc]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      stopPullers();
      audio.current?.source?.stop();
      void audio.current?.ctx.close();
    },
    []
  );

  /** Subscribe to the clock without re-rendering (the playhead moves by transform). */
  const onTick = useCallback((f: (ms: number) => void) => {
    listeners.current.add(f);
    f(timeRef.current);
    return () => {
      listeners.current.delete(f);
    };
  }, []);

  return {
    playing,
    loading,
    time,
    length: docDuration(doc),
    play,
    pause,
    seek,
    toggle: () => (playing ? pause() : void play()),
    onTick,
    fontReady: () =>
      document.fonts
        .load(`500 ${titleSize(doc.height)}px ${readTheme().family}`)
        .catch(() => {}),
  };
}
