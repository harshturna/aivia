import type { Adjust } from "./schema";

/**
 * Adjust as one colour matrix (TICKET-067): 4×5, row-major, the form SVG's feColorMatrix takes,
 * applied to 0–255 channels with the offsets in 0–255 too. Brightness and warmth shift,
 * contrast scales around the middle, saturation mixes toward the luminance (Rec. 709).
 */
export type Matrix = number[];

const IDENTITY: Matrix = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

/** a × b: b applies first. */
function multiply(a: Matrix, b: Matrix): Matrix {
  const out = new Array(20).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      let v = c === 4 ? a[r * 5 + 4] : 0;
      for (let k = 0; k < 4; k++) v += a[r * 5 + k] * b[k * 5 + c];
      out[r * 5 + c] = v;
    }
  }
  return out;
}

export function adjustMatrix({
  brightness,
  contrast,
  saturation,
  warmth,
}: Adjust): Matrix {
  let m = IDENTITY;
  // saturation: -100 is grey, +100 doubles the colour
  const s = 1 + saturation / 100;
  const [lr, lg, lb] = [0.2126, 0.7152, 0.0722];
  m = multiply(
    [
      lr * (1 - s) + s,
      lg * (1 - s),
      lb * (1 - s),
      0,
      0,
      lr * (1 - s),
      lg * (1 - s) + s,
      lb * (1 - s),
      0,
      0,
      lr * (1 - s),
      lg * (1 - s),
      lb * (1 - s) + s,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ],
    m
  );
  // contrast: around the middle grey, from flat at -100 to twice at +100
  const c = 1 + contrast / 100;
  const off = 127.5 * (1 - c);
  m = multiply(
    [c, 0, 0, 0, off, 0, c, 0, 0, off, 0, 0, c, 0, off, 0, 0, 0, 1, 0],
    m
  );
  // brightness: a shift of up to 40% of the range
  const b = (brightness / 100) * 102;
  // warmth: red up and blue down (or the reverse), up to 12% of the range
  const w = (warmth / 100) * 30;
  m = multiply(
    [1, 0, 0, 0, b + w, 0, 1, 0, 0, b, 0, 0, 1, 0, b - w, 0, 0, 0, 1, 0],
    m
  );
  return m;
}

export const isIdentity = (m: Matrix) =>
  m.every((v, i) => Math.abs(v - IDENTITY[i]) < 1e-9);

/** Applies the matrix to RGBA pixels in place. */
export function applyMatrix(data: Uint8ClampedArray, m: Matrix) {
  if (isIdentity(m)) return;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    data[i] = m[0] * r + m[1] * g + m[2] * b + m[3] * a + m[4];
    data[i + 1] = m[5] * r + m[6] * g + m[7] * b + m[8] * a + m[9];
    data[i + 2] = m[10] * r + m[11] * g + m[12] * b + m[13] * a + m[14];
  }
}
