/**
 * What the editor opens by address (TICKET-067, hardened in TICKET-079): generated media, the
 * site's own pictures, an AI step's result, and our own storage. Anything else is refused, so
 * the editor never draws or forwards an address someone else chose. Every check is made on the
 * normalised address, so an encoded `..` cannot walk out of our storage folder.
 */
export function isEditableUrl(
  url: string,
  storageBase: string,
  appOrigin?: string
) {
  if (/^\/landing\/[\w-]+(\.[\w-]+)*$/i.test(url)) return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  // the site's own pictures, by its own origin (http in development)
  if (appOrigin && /^\/landing\/[\w-]+(\.[\w-]+)*$/i.test(parsed.pathname)) {
    try {
      if (parsed.origin === new URL(appOrigin).origin) return true;
    } catch {}
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname;
  if (host === "fal.media" || host.endsWith(".fal.media")) return true;
  if (host === "res.cloudinary.com") return true;
  if (storageBase) {
    const ours = `${storageBase.replace(/\/$/, "")}/storage/v1/object/public/media/`;
    if (parsed.href.startsWith(ours)) return true;
  }
  return false;
}
