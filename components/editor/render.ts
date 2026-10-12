import { turned } from "@/lib/image-edit/geometry";
import { adjustMatrix, applyMatrix } from "@/lib/image-edit/matrix";
import type { ImageEdit, TextBox } from "@/lib/image-edit/schema";

/**
 * The one way an edit becomes pixels (TICKET-067), for the stage and for Save alike: the base
 * turned and flipped, cropped, put through the colour matrix, then given its words.
 */
export type Fonts = { display: string; body: string };

export function readFonts(): Fonts {
  const css = getComputedStyle(document.documentElement);
  return {
    display:
      css.getPropertyValue("--font-cormorant").trim() || "Georgia, serif",
    body: css.getPropertyValue("--font-host").trim() || "system-ui, sans-serif",
  };
}

const images = new Map<string, Promise<HTMLImageElement>>();

/** A picture drawn to a canvas must come with CORS, or the canvas cannot be read or saved. */
export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = images.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => {
        images.delete(url);
        reject(new Error("That picture did not load"));
      };
      img.src = url;
    });
    images.set(url, p);
  }
  return p;
}

export const fontOf = (t: TextBox, px: number, fonts: Fonts) =>
  `${t.face === "display" ? 500 : 600} ${Math.round(px)}px ${t.face === "display" ? fonts.display : fonts.body}`;

/** The words' boxes, in fractions of the output, for the stage to hit and drag. */
export type Box = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function renderEdit(
  doc: ImageEdit,
  base: HTMLImageElement,
  {
    canvas = document.createElement("canvas"),
    maxSide = 4096,
    fonts,
    crop = true,
    words = true,
  }: {
    canvas?: HTMLCanvasElement;
    maxSide?: number;
    fonts: Fonts;
    /** Off while cropping: the stage shows the whole turned picture under the box. */
    crop?: boolean;
    words?: boolean;
  }
): { canvas: HTMLCanvasElement; boxes: Box[] } {
  const bw = base.naturalWidth;
  const bh = base.naturalHeight;
  const t = turned({ width: bw, height: bh }, doc.rotate);
  const c = crop && doc.crop ? doc.crop : { x: 0, y: 0, width: 1, height: 1 };
  const cx = c.x * t.width;
  const cy = c.y * t.height;
  const cw = Math.max(1, c.width * t.width);
  const ch = Math.max(1, c.height * t.height);
  const scale = Math.min(1, maxSide / Math.max(cw, ch));
  const W = Math.max(1, Math.round(cw * scale));
  const H = Math.max(1, Math.round(ch * scale));
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { canvas, boxes: [] };

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  // into the turned picture's space: mirror there, then turn the base about its middle
  ctx.translate(t.width / 2, t.height / 2);
  if (doc.flip) ctx.scale(-1, 1);
  ctx.rotate((doc.rotate * Math.PI) / 180);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(base, -bw / 2, -bh / 2);
  ctx.restore();

  const m = adjustMatrix(doc.adjust);
  const pixels = ctx.getImageData(0, 0, W, H);
  applyMatrix(pixels.data, m);
  ctx.putImageData(pixels, 0, 0);

  const boxes: Box[] = [];
  if (words)
    for (const box of doc.texts) {
      const px = box.size * H;
      ctx.font = fontOf(box, px, fonts);
      // the words wrap inside the picture, never past its edges
      const lines = box.text
        .split("\n")
        .flatMap((line) => wrap(ctx, line, W * 0.9));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineH = px * 1.12;
      const width = Math.max(
        px * 0.6,
        ...lines.map((l) => ctx.measureText(l).width)
      );
      const height = lineH * lines.length;
      const x = box.x * W;
      const y = box.y * H;
      if (box.text.trim()) {
        ctx.save();
        // a soft shadow keeps light words readable on a light picture
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = px * 0.18;
        ctx.fillStyle = box.color;
        lines.forEach((line, i) => {
          ctx.fillText(line, x, y - height / 2 + lineH * (i + 0.5));
        });
        ctx.restore();
      }
      boxes.push({
        id: box.id,
        x: (x - width / 2) / W,
        y: (y - height / 2) / H,
        width: width / W,
        height: height / H,
      });
    }
  return { canvas, boxes };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  out.push(line);
  return out;
}

/** A transparent cut-out keeps its transparency; everything else saves as a JPEG. */
export const keepsAlpha = (doc: ImageEdit) =>
  doc.ai.some((s) => s.tool === "removeBackground");
