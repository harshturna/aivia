/**
 * A piece of media as every surface sees it (D-005, TICKET-063): the thread, a project's tray,
 * the Library and the lightbox. An asset id is there when the piece is a saved library item;
 * the guest's own pieces and a run's outputs before they are saved have only an address.
 */
export type MediaKind = "image" | "video" | "music" | "sound";

export type MediaItem = {
  url: string;
  kind: MediaKind;
  prompt: string;
  assetId?: string;
  projectId?: string | null;
  favorite?: boolean;
};

/** A piece as a File, for the composer's attachments: fetched, as the media host allows. */
export async function fileFromUrl(url: string, name: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not fetch that piece");
  const blob = await response.blob();
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return new File([blob], `${name}.${ext}`, {
    type: blob.type || "image/jpeg",
  });
}

/** The frame a video element is showing, as an image file (it must be loaded crossOrigin). */
export async function frameOf(
  video: HTMLVideoElement,
  name: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/jpeg", 0.9)
  );
  if (!blob) throw new Error("Could not read that frame");
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

/** A short, safe name from a prompt. */
export function nameFrom(prompt: string, fallback: string) {
  const n = prompt
    .split(/\s+/)
    .slice(0, 6)
    .join(" ")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .trim();
  return n || fallback;
}

/** A project's versions as tray pieces (TICKET-067): edited images and kept cuts. */
export function versionItems(
  assets: Array<{
    id: string;
    url: string;
    kind: string;
    prompt: string;
    sessionId: string | null;
    favorite: boolean;
  }>
): MediaItem[] {
  return assets
    .filter((a) => a.kind === "image" || a.kind === "video")
    .map((a) => ({
      url: a.url,
      kind: a.kind as MediaKind,
      prompt: a.prompt,
      assetId: a.id,
      projectId: a.sessionId,
      favorite: a.favorite,
    }));
}

/** The tray's groups: the versions first, as one group, then the briefs. */
export function withVersions<
  T extends { id: string; brief: string; items: MediaItem[] },
>(versions: MediaItem[], briefs: T[]) {
  return versions.length
    ? [{ id: "versions", brief: "Edits and cuts", items: versions }, ...briefs]
    : briefs;
}

const KIND_OF_TOOL: Record<string, MediaKind> = {
  "tool-generate_image": "image",
  "tool-generate_video": "video",
  "tool-generate_music": "music",
  "tool-generate_sound_effect": "sound",
};

type PartLike = {
  type: string;
  state?: string;
  text?: string;
  input?: { prompt?: string };
  output?: { url?: string; urls?: string[]; prompt?: string };
};
type MessageLike = { id: string; role: string; parts: PartLike[] };

/**
 * A project's media, grouped by the brief that made it, newest brief first (§17.2): every
 * finished output of every run, in the order it was made within its run.
 */
export function mediaByBrief(messages: MessageLike[]) {
  const groups: Array<{ id: string; brief: string; items: MediaItem[] }> = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const brief = m.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    const answer =
      messages[i + 1]?.role === "assistant" ? messages[i + 1] : null;
    const items: MediaItem[] = [];
    for (const p of answer?.parts ?? []) {
      const kind = KIND_OF_TOOL[p.type];
      if (!kind || p.state !== "output-available" || !p.output) continue;
      const prompt = p.output.prompt ?? p.input?.prompt ?? "";
      for (const url of p.output.urls ?? (p.output.url ? [p.output.url] : []))
        items.push({ url, kind, prompt });
    }
    if (items.length) groups.push({ id: m.id, brief, items });
  }
  return groups.reverse();
}
