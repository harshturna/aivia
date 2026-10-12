import type { Edit, Prisma } from "@prisma/client";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";
import { migrate } from "@/lib/timeline/migrate";
import type { TimelineDoc } from "@/lib/timeline/schema";

/**
 * Edits (D-005, TICKET-064): a project's cuts, each one versioned document saved whole. Every
 * read and write is scoped by the owner; the shared guest account writes nothing (its edits
 * live in the browser). A save names the `rev` it read: a stale one is refused, so two tabs
 * cannot silently overwrite each other. Image edits join with TICKET-067.
 */

/** A saved cut is small (thirty items is about 15 KB); this keeps it that way. */
export const MAX_DOC_BYTES = 200 * 1024;

export type EditSummary = Pick<
  Edit,
  "id" | "projectId" | "kind" | "title" | "rev" | "outputAssetId" | "updatedAt"
>;

const summary = {
  id: true,
  projectId: true,
  kind: true,
  title: true,
  rev: true,
  outputAssetId: true,
  updatedAt: true,
} as const;

/** A document fit to save: a current cut, under the size cap. */
export function checkDoc(
  raw: unknown
): { ok: true; doc: TimelineDoc } | { ok: false; error: string } {
  if (JSON.stringify(raw ?? null).length > MAX_DOC_BYTES)
    return { ok: false, error: "The cut is too large to save" };
  const loaded = migrate(raw);
  if (!loaded.ok) return { ok: false, error: loaded.error };
  if (loaded.readOnly || !loaded.doc)
    return { ok: false, error: "This cut was made by a newer Aivia; reload" };
  return { ok: true, doc: loaded.doc };
}

export async function listEdits(userId: string, projectId: string) {
  if (isGuestId(userId)) return [];
  return prismadb.edit.findMany({
    where: { userId, projectId },
    orderBy: { updatedAt: "desc" },
    select: summary,
  });
}

export async function getEdit(userId: string, id: string) {
  if (isGuestId(userId)) return null;
  return prismadb.edit.findFirst({ where: { id, userId } });
}

export async function createEdit(
  userId: string,
  input: { projectId: string | null; title?: string; doc: TimelineDoc }
) {
  if (isGuestId(userId))
    throw new Error("The guest keeps edits in the browser");
  return prismadb.edit.create({
    data: {
      userId,
      projectId: input.projectId,
      kind: "timeline",
      title: input.title?.slice(0, 120) || "Untitled cut",
      doc: input.doc as unknown as Prisma.InputJsonValue,
      version: input.doc.version,
    },
    select: summary,
  });
}

/** Saves over `rev`; null when the edit is not the caller's, "stale" when someone saved first. */
export async function saveEdit(
  userId: string,
  id: string,
  rev: number,
  changes: { doc?: TimelineDoc; title?: string; outputAssetId?: string }
): Promise<EditSummary | "stale" | null> {
  if (isGuestId(userId)) return null;
  const { count } = await prismadb.edit.updateMany({
    where: { id, userId, rev },
    data: {
      ...(changes.doc
        ? {
            doc: changes.doc as unknown as Prisma.InputJsonValue,
            version: changes.doc.version,
          }
        : {}),
      ...(changes.title !== undefined
        ? { title: changes.title.slice(0, 120) }
        : {}),
      ...(changes.outputAssetId
        ? { outputAssetId: changes.outputAssetId }
        : {}),
      rev: { increment: 1 },
    },
  });
  if (count === 1)
    return prismadb.edit.findFirst({ where: { id, userId }, select: summary });
  const exists = await prismadb.edit.count({ where: { id, userId } });
  return exists ? "stale" : null;
}

export async function deleteEdit(userId: string, id: string) {
  if (isGuestId(userId)) return 0;
  const { count } = await prismadb.edit.deleteMany({ where: { id, userId } });
  return count;
}

/** Marks the last export of an edit, without touching its document or rev. */
export async function setEditOutput(
  userId: string,
  id: string,
  assetId: string
) {
  if (isGuestId(userId)) return;
  await prismadb.edit.updateMany({
    where: { id, userId },
    data: { outputAssetId: assetId },
  });
}
