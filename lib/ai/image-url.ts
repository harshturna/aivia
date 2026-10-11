/**
 * Which image addresses the server will hand to the animation model (TICKET-042). https URLs
 * pass through (fal fetches them itself, not this server); image data URLs pass under a size
 * cap; the site's own media pass only as an exact `/landing/<file>` path, which the server
 * fetches from its own origin. Anything else (protocol-relative `//host`, `/\host`, `http:`,
 * paths outside /landing) is refused, so a brief cannot make this server fetch another host.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SITE_MEDIA =
  /^\/landing\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|webp)$/i;

export type ImageSource = "remote" | "data" | "site";

export function classifyImageUrl(url: unknown): ImageSource | null {
  if (typeof url !== "string") return null;
  if (url.startsWith("https://")) {
    try {
      return new URL(url).protocol === "https:" ? "remote" : null;
    } catch {
      return null;
    }
  }
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(url))
    return url.length <= Math.ceil(MAX_IMAGE_BYTES * 1.37) ? "data" : null;
  if (SITE_MEDIA.test(url) && !url.includes("..")) return "site";
  return null;
}
