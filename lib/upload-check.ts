/**
 * What the server checks before recording an upload as a library piece (TICKET-064): that the
 * address is a file in our bucket, in the caller's own folder, with a name we make; and that
 * its first bytes are the kind of file its name says.
 */
export const BUCKET = "media";

export const UPLOAD_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
export type UploadExt = keyof typeof UPLOAD_TYPES;

/** `<user id>/<uuid>.<ext>`, nothing else: no folders of our own making, no other user's. */
export function checkPath(userId: string, path: string): UploadExt | null {
  const m = path.match(
    /^([0-9a-f-]{36})\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm|jpg|png|webp)$/
  );
  if (!m || m[1] !== userId) return null;
  return m[2] as UploadExt;
}

/** The file's own signature, read from its first bytes. */
export function sniff(head: Uint8Array): UploadExt | null {
  const at = (i: number) => head[i] ?? -1;
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...Array.from(head.slice(from, to)));
  if (ascii(4, 8) === "ftyp") return "mp4";
  if (at(0) === 0x1a && at(1) === 0x45 && at(2) === 0xdf && at(3) === 0xa3)
    return "webm";
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "jpg";
  if (at(0) === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

/** The public address of a file in the bucket. */
export function publicUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}
