import { withAlpha } from "@/lib/color";
import type { Layer } from "@/lib/timeline/layout";

/**
 * Draws one frame of a cut (TICKET-061): the layers `layersAt` returns, with their pictures
 * already decoded. The player and export both call this, so what you watch is what you get.
 * Canvas 2D only, no `ctx.filter` (Safari has it off).
 */
export type Theme = { bg: string; fg: string; family: string };

export type Resolved =
  | {
      layer: Extract<Layer, { kind: "video" }>;
      picture: CanvasImageSource | null;
    }
  | {
      layer: Extract<Layer, { kind: "image" }>;
      picture: (CanvasImageSource & { width: number; height: number }) | null;
    }
  | { layer: Extract<Layer, { kind: "text" }> };

/** The app's colours and display face, read from the design tokens. */
export function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  return {
    // the tokens always exist where a cut is drawn (the app and its export)
    bg: css.getPropertyValue("--color-bg").trim(),
    fg: css.getPropertyValue("--color-fg").trim(),
    family: css.getPropertyValue("--font-cormorant").trim() || "Georgia, serif",
  };
}

/** The title's size for a frame height; captions draw at 0.78 of it. */
export const titleSize = (height: number) => Math.round(height * 0.09);

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

function words(
  ctx: CanvasRenderingContext2D,
  text: string,
  preset: "title" | "caption",
  y: number,
  w: number,
  h: number,
  theme: Theme
) {
  const size = titleSize(h) * (preset === "title" ? 1 : 0.78);
  ctx.font = `500 ${Math.round(size)}px ${theme.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.fg;
  ctx.shadowColor = withAlpha(theme.bg, 0.55);
  ctx.shadowBlur = titleSize(h) * 0.6;
  const lines = wrap(ctx, text, w * 0.78);
  const lh = size * 1.15;
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, y + (i - (lines.length - 1) / 2) * lh);
  });
  ctx.shadowBlur = 0;
}

function scrim(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: Theme
) {
  const g = ctx.createLinearGradient(0, h * 0.55, 0, h);
  g.addColorStop(0, withAlpha(theme.bg, 0));
  g.addColorStop(1, withAlpha(theme.bg, 0.65));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  layers: Resolved[],
  theme: Theme
) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, w, h);
  // a card on screen speaks for the frame: a still's own words wait (TICKET-074)
  const card = layers.some((r) => r.layer.kind === "text");
  for (const r of layers) {
    ctx.globalAlpha = r.layer.alpha;
    if (r.layer.kind === "video") {
      const picture = (r as { picture: CanvasImageSource | null }).picture;
      if (picture) ctx.drawImage(picture, 0, 0, w, h);
    } else if (r.layer.kind === "image") {
      const picture = (r as Extract<Resolved, { layer: { kind: "image" } }>)
        .picture;
      if (picture) drawCover(ctx, picture, w, h, r.layer.zoom);
      if (r.layer.item.text && !card) {
        scrim(ctx, w, h, theme);
        words(ctx, r.layer.item.text, "caption", h * 0.84, w, h, theme);
      }
    } else {
      const { item } = r.layer;
      if (item.style.scrim) scrim(ctx, w, h, theme);
      words(
        ctx,
        item.text,
        item.style.preset,
        item.style.preset === "title" ? h / 2 : h * 0.84,
        w,
        h,
        theme
      );
    }
  }
  ctx.globalAlpha = 1;
}
