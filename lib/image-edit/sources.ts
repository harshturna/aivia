/**
 * What the editor opens by address (TICKET-067): generated media, the site's own pictures,
 * an AI step's result, and our own storage. Anything else is refused, so the editor never
 * draws or forwards an address someone else chose.
 */
export function isEditableUrl(url: string, storageBase: string) {
  if (/^\/landing\/[\w.-]+$/i.test(url)) return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname;
  if (host === "fal.media" || host.endsWith(".fal.media")) return true;
  if (host === "res.cloudinary.com") return true;
  if (storageBase) {
    const ours = `${storageBase.replace(/\/$/, "")}/storage/v1/object/public/media/`;
    if (url.startsWith(ours) && !parsed.pathname.includes("..")) return true;
  }
  return false;
}
