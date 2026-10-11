"use client";

/**
 * Saves a file instead of opening it (TICKET-051). Generated media lives on another origin,
 * where the `download` attribute is ignored, so the file is fetched into a blob and saved from
 * this page; the media host allows that. If the fetch fails, the file opens in a new tab.
 */
export async function downloadFile(url: string, name: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${name}${extensionOf(url, blob.type)}`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
};

function extensionOf(url: string, type: string) {
  const fromUrl = url.split("?")[0].match(/\.([a-z0-9]{2,4})$/i)?.[1];
  return fromUrl ? `.${fromUrl.toLowerCase()}` : (BY_TYPE[type] ?? "");
}

/** A file name from a prompt: its first words, safe on every system. */
export function fileNameFrom(prompt: string, fallback: string) {
  const name = prompt
    .split(/\s+/)
    .slice(0, 6)
    .join(" ")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .trim();
  return name || fallback;
}
