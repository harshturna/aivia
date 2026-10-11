import { randomUUID } from "node:crypto";
import type { Asset, AssetKind, Prisma } from "@prisma/client";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";

/**
 * Assets (design §12): every image, clip, track or sound the tools made, written by the
 * tool itself so it is kept even when the stream is abandoned. Scoped by owner everywhere.
 * The shared guest account keeps nothing: its outputs are returned unsaved, and it reads only
 * the assets of its pinned example sessions (TICKET-038).
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

/**
 * Records a generation that already succeeded (and was paid for). The output still reaches
 * the person if the library write fails; it is only missing from the library (TICKET-043).
 */
export async function keepAsset(input: RecordAssetInput): Promise<void> {
  try {
    await recordAsset(input);
  } catch (error) {
    console.error("[ASSET_RECORD]", error);
  }
}

export async function recordAsset(input: RecordAssetInput): Promise<Asset> {
  if (isGuestId(input.userId))
    return {
      id: randomUUID(),
      userId: input.userId,
      sessionId: null,
      kind: input.kind,
      url: input.url,
      posterUrl: input.posterUrl ?? null,
      prompt: input.prompt,
      model: input.model,
      params: (input.params ?? {}) as Prisma.JsonValue,
      width: input.width ?? null,
      height: input.height ?? null,
      durationSec: input.durationSec ?? null,
      favorite: false,
      createdAt: new Date(),
    };
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
  /** One project's media (TICKET-062). */
  project?: string;
  cursor?: string | null;
  limit?: number;
}

/** Newest first, by cursor (the last row's id), with the kind, a search and favourites. */
export async function listAssets(
  userId: string,
  {
    kind,
    query,
    favorite,
    project,
    cursor,
    limit = PAGE_SIZE,
  }: ListAssetsOptions = {}
) {
  const where: Prisma.AssetWhereInput = {
    userId,
    ...(isGuestId(userId) ? { session: { pinned: true } } : {}),
    ...(kind === "audio"
      ? { kind: { in: ["music", "sound"] } }
      : kind
        ? { kind }
        : {}),
    ...(favorite ? { favorite: true } : {}),
    ...(project ? { sessionId: project } : {}),
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
  return prismadb.asset.findFirst({
    where: {
      id,
      userId,
      ...(isGuestId(userId) ? { session: { pinned: true } } : {}),
    },
  });
}

/**
 * The assets either side of one in the library's order (newest first), for previous and next
 * in the lightbox (TICKET-053). Ties on the time fall back to the id, as the list does.
 */
export async function getNeighbors(
  userId: string,
  asset: { id: string; createdAt: Date }
) {
  const scope: Prisma.AssetWhereInput = {
    userId,
    ...(isGuestId(userId) ? { session: { pinned: true } } : {}),
  };
  const { id, createdAt } = asset;
  const [newer, older] = await Promise.all([
    prismadb.asset.findFirst({
      where: {
        ...scope,
        OR: [{ createdAt: { gt: createdAt } }, { createdAt, id: { gt: id } }],
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    }),
    prismadb.asset.findFirst({
      where: {
        ...scope,
        OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true },
    }),
  ]);
  return { prev: newer?.id ?? null, next: older?.id ?? null };
}

export async function setFavorite(
  userId: string,
  id: string,
  favorite: boolean
) {
  if (isGuestId(userId)) return 0;
  const { count } = await prismadb.asset.updateMany({
    where: { id, userId },
    data: { favorite },
  });
  return count;
}

export async function deleteAsset(userId: string, id: string) {
  if (isGuestId(userId)) return 0;
  const { count } = await prismadb.asset.deleteMany({ where: { id, userId } });
  return count;
}

export { groupByDay } from "@/lib/day-groups";
