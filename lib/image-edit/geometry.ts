import {
  type AiStep,
  baseOf,
  type Crop,
  type CropShape,
  type ImageEdit,
} from "./schema";

/**
 * The editor's shapes (TICKET-067). A crop is held in fractions of the turned picture; these
 * turn shapes into fractions and keep a moved or resized box inside the picture.
 */
export const MIN_CROP = 0.05;

/** The picture's size once turned by a multiple of 90°. */
export function turned(
  size: { width: number; height: number },
  rotate: number
) {
  return rotate % 180 === 0
    ? { width: size.width, height: size.height }
    : { width: size.height, height: size.width };
}

/** A shape's width over its height; null for free. */
export function ratioOf(shape: CropShape): number | null {
  if (shape === "free") return null;
  const [w, h] = shape.split(":").map(Number);
  return w / h;
}

/** The largest centred box of a shape on a picture of this size, in fractions. */
export function fitCrop(
  shape: CropShape,
  size: { width: number; height: number }
): Crop {
  const ratio = ratioOf(shape);
  if (!ratio) return { shape, x: 0, y: 0, width: 1, height: 1 };
  const pictureRatio = size.width / size.height;
  // in fractions, a box of ratio r has width/height = r / pictureRatio
  const rel = ratio / pictureRatio;
  const width = rel >= 1 ? 1 : rel;
  const height = rel >= 1 ? 1 / rel : 1;
  return { shape, x: (1 - width) / 2, y: (1 - height) / 2, width, height };
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Moves a box by fractions, inside the picture. */
export function moveCrop(crop: Crop, dx: number, dy: number): Crop {
  return {
    ...crop,
    x: clamp(crop.x + dx, 0, 1 - crop.width),
    y: clamp(crop.y + dy, 0, 1 - crop.height),
  };
}

/**
 * Drags one corner to a point, the opposite corner fixed. A fixed shape keeps its ratio (by the
 * wider of the two moves), and every box stays inside the picture and above the minimum.
 */
export function resizeCrop(
  crop: Crop,
  corner: "nw" | "ne" | "sw" | "se",
  point: { x: number; y: number },
  size: { width: number; height: number }
): Crop {
  const ax = corner.includes("w") ? crop.x + crop.width : crop.x;
  const ay = corner.includes("n") ? crop.y + crop.height : crop.y;
  const px = clamp(point.x, 0, 1);
  const py = clamp(point.y, 0, 1);
  let w = Math.max(MIN_CROP, Math.abs(px - ax));
  let h = Math.max(MIN_CROP, Math.abs(py - ay));
  const ratio = ratioOf(crop.shape);
  if (ratio) {
    const rel = ratio / (size.width / size.height);
    // fit the shape inside what was dragged, then inside what the picture leaves
    if (w / h > rel) w = h * rel;
    else h = w / rel;
    const maxW = corner.includes("w") ? ax : 1 - ax;
    const maxH = corner.includes("n") ? ay : 1 - ay;
    if (w > maxW) {
      w = maxW;
      h = w / rel;
    }
    if (h > maxH) {
      h = maxH;
      w = h * rel;
    }
  } else {
    w = Math.min(w, corner.includes("w") ? ax : 1 - ax);
    h = Math.min(h, corner.includes("n") ? ay : 1 - ay);
  }
  return {
    ...crop,
    x: corner.includes("w") ? ax - w : ax,
    y: corner.includes("n") ? ay - h : ay,
    width: w,
    height: h,
  };
}

/** Where a crop sits after the picture turns a quarter clockwise (or flips across). */
export function turnCrop(crop: Crop, by: "cw" | "flip"): Crop {
  const shape: CropShape =
    by === "cw" && crop.shape !== "free" && crop.shape !== "1:1"
      ? (crop.shape.split(":").reverse().join(":") as CropShape)
      : crop.shape;
  if (by === "flip") return { ...crop, x: 1 - crop.x - crop.width };
  return {
    shape,
    x: 1 - crop.y - crop.height,
    y: crop.x,
    width: crop.height,
    height: crop.width,
  };
}

/**
 * An AI step added to an edit (TICKET-072). The result can change the picture's shape (Fill), so
 * a fixed-shape crop is fitted again to the new picture; a free crop keeps its fractions.
 */
export function withStep(doc: ImageEdit, step: AiStep): ImageEdit {
  const before = baseOf(doc);
  const next: ImageEdit = { ...doc, ai: [...doc.ai, step] };
  const reshaped =
    Math.abs(before.width / before.height - step.width / step.height) > 0.01;
  if (doc.crop && doc.crop.shape !== "free" && reshaped)
    next.crop = fitCrop(
      doc.crop.shape,
      turned({ width: step.width, height: step.height }, doc.rotate)
    );
  return next;
}
