import type { Asset, AssetKind, Prisma } from "@prisma/client";
import prismadb from "@/lib/prismadb";

/**
 * Assets (design §12): every image, clip, track or sound the tools made, written by the
 * tool itself so it is kept even when the stream is abandoned. Scoped by owner everywhere.
 */
export type { Asset, AssetKind };

export interface RecordAssetInput {
  userId: string;
  sessionId?: string | null;
  kind: AssetKind;
  url: string;
  posterUrl?: string | null;
  prompt: string;
  model: string;
  params?: Record<string, unknown>;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
}

export async function recordAsset(input: RecordAssetInput): Promise<Asset> {
  return prismadb.asset.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId ?? null,
      kind: input.kind,
      url: input.url,
      posterUrl: input.posterUrl ?? null,
      prompt: input.prompt,
      model: input.model,
      params: (input.params ?? {}) as Prisma.InputJsonValue,
      width: input.width ?? null,
      height: input.height ?? null,
      durationSec: input.durationSec ?? null,
    },
  });
}

export const PAGE_SIZE = 48;

export interface ListAssetsOptions {
  kind?: AssetKind | "audio";
  query?: string;
  favorite?: boolean;
  cursor?: string | null;
  limit?: number;
}

/** Newest first, by cursor (the last row's id), with the kind, a search and favourites. */
export async function listAssets(
  userId: string,
  { kind, query, favorite, cursor, limit = PAGE_SIZE }: ListAssetsOptions = {}
) {
  const where: Prisma.AssetWhereInput = {
    userId,
    ...(kind === "audio"
      ? { kind: { in: ["music", "sound"] } }
      : kind
        ? { kind }
        : {}),
    ...(favorite ? { favorite: true } : {}),
    ...(query?.trim()
      ? { prompt: { contains: query.trim(), mode: "insensitive" } }
      : {}),
  };
  const rows = await prismadb.asset.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

export async function getAsset(userId: string, id: string) {
  return prismadb.asset.findFirst({ where: { id, userId } });
}

export async function setFavorite(
  userId: string,
  id: string,
  favorite: boolean
) {
  const { count } = await prismadb.asset.updateMany({
    where: { id, userId },
    data: { favorite },
  });
  return count;
}

export async function deleteAsset(userId: string, id: string) {
  const { count } = await prismadb.asset.deleteMany({ where: { id, userId } });
  return count;
}

/**
 * Groups rows by the day they were made, newest day first, labelled "Today", "Yesterday"
 * or the date, in the viewer's time zone (design §6).
 */
export function groupByDay<T extends { createdAt: Date }>(
  rows: T[],
  now = new Date(),
  timeZone?: string
): Array<{ label: string; day: string; items: T[] }> {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayOf = (d: Date) => fmt.format(d);
  const today = dayOf(now);
  const yesterday = dayOf(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const label = (day: string) =>
    day === today
      ? "Today"
      : day === yesterday
        ? "Yesterday"
        : new Intl.DateTimeFormat("en-GB", {
            timeZone,
            day: "numeric",
            month: "long",
            ...(day.slice(0, 4) !== today.slice(0, 4)
              ? { year: "numeric" }
              : {}),
          }).format(new Date(`${day}T12:00:00Z`));

  const groups: Array<{ label: string; day: string; items: T[] }> = [];
  for (const row of rows) {
    const day = dayOf(row.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(row);
    else groups.push({ label: label(day), day, items: [row] });
  }
  return groups;
}
