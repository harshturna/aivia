/**
 * A piece's own size, read from its file (TICKET-072): a take keeps the shape of what it
 * replaces. Loaded fresh, so a picture far up an unscrolled thread (lazy, not yet loaded)
 * measures as well as one on screen.
 */
export function measure(
  url: string,
  kind: "image" | "video"
): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (kind === "image") {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(undefined);
      img.src = url;
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      video.removeAttribute("src");
      video.load();
    };
    video.onerror = () => resolve(undefined);
    video.src = url;
  });
}
