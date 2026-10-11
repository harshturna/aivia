/** An asset as the library client holds it: dates as ISO strings, from the server or the API. */
export interface LibraryAsset {
  id: string;
  sessionId: string | null;
  kind: "image" | "video" | "music" | "sound";
  url: string;
  posterUrl: string | null;
  prompt: string;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  favorite: boolean;
  createdAt: string;
}

export type LibraryKind = "all" | "image" | "video" | "audio";

export function toLibraryAsset(row: {
  id: string;
  sessionId: string | null;
  kind: string;
  url: string;
  posterUrl: string | null;
  prompt: string;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  favorite: boolean;
  createdAt: Date | string;
}): LibraryAsset {
  return {
    id: row.id,
    sessionId: row.sessionId,
    kind: row.kind as LibraryAsset["kind"],
    url: row.url,
    posterUrl: row.posterUrl,
    prompt: row.prompt,
    width: row.width,
    height: row.height,
    durationSec: row.durationSec,
    favorite: row.favorite,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt.toISOString(),
  };
}
