/**
 * A token's colour at an opacity, for canvas code (TICKET-077): a canvas cannot read CSS
 * variables or `color-mix`, so the drawn shadows and scrims are built from the token's own value
 * instead of a colour written into the code.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const n = Number.parseInt(hex, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const rgb = color.trim().match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
  return color;
}
