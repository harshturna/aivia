import type { Prisma, Session } from "@prisma/client";
import type { UIMessage } from "ai";
import { isGuestId } from "@/lib/guest-user";
import prismadb from "@/lib/prismadb";

export {
  isSessionId,
  messageText,
  projectTitle,
  titleFromBrief,
} from "@/lib/session-text";

/**
 * Sessions (design §12): a Studio conversation, its messages as the AI SDK's UIMessage[]
 * in one JSON column. Every read and write is scoped by the owner's user id; a row that is
 * not the caller's reads as absent. The shared guest account writes nothing and reads only its
 * pinned examples (TICKET-038).
 */

export type SessionSummary = Pick<
  Session,
  "id" | "title" | "mode" | "pinned" | "createdAt" | "updatedAt"
>;

const summary = {
  id: true,
  title: true,
  mode: true,
  pinned: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Recents. The guest account is shared, so a guest sees only the pinned examples. */
export async function listSessions(
  userId: string,
  { limit = 8 }: { limit?: number } = {}
): Promise<SessionSummary[]> {
  return prismadb.session.findMany({
    where: { userId, ...(isGuestId(userId) ? { pinned: true } : {}) },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: summary,
  });
}

/** A project as Home shows it: its summary and its first three pieces (TICKET-062). */
export type ProjectCard = SessionSummary & {
  media: Array<{ url: string; kind: string; posterUrl: string | null }>;
};

export async function listProjects(
  userId: string,
  { limit = 24 }: { limit?: number } = {}
): Promise<ProjectCard[]> {
  const rows = await prismadb.session.findMany({
    where: { userId, ...(isGuestId(userId) ? { pinned: true } : {}) },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      ...summary,
      assets: {
        orderBy: { createdAt: "asc" },
        take: 3,
        select: { url: true, kind: true, posterUrl: true },
      },
    },
  });
  return rows.map(({ assets, ...rest }) => ({ ...rest, media: assets }));
}

export async function getSession(userId: string, id: string) {
  const session = await prismadb.session.findFirst({
    where: { id, userId, ...(isGuestId(userId) ? { pinned: true } : {}) },
  });
  if (!session) return null;
  return {
    ...session,
    messages: (session.messages as unknown as UIMessage[]) ?? [],
  };
}

/**
 * Creates the row if the id is new to this user; the client makes the id up front. The guest
 * never gets a row: callers run a guest unsaved and do not call this (it throws if they do).
 */
export async function ensureSession(
  userId: string,
  id: string,
  mode = "auto"
): Promise<Session> {
  if (isGuestId(userId)) throw new Error("Guest sessions are not stored");
  const existing = await prismadb.session.findFirst({ where: { id, userId } });
  if (existing) return existing;
  return prismadb.session.create({ data: { id, userId, mode } });
}

export async function saveMessages(
  userId: string,
  id: string,
  messages: UIMessage[]
) {
  if (isGuestId(userId)) return;
  await prismadb.session.updateMany({
    where: { id, userId },
    data: { messages: messages as unknown as Prisma.InputJsonValue },
  });
}

export async function renameSession(userId: string, id: string, title: string) {
  const clean = title.trim().slice(0, 80);
  if (!clean || isGuestId(userId)) return 0;
  const { count } = await prismadb.session.updateMany({
    where: { id, userId },
    data: { title: clean },
  });
  return count;
}

/** A pinned session (the guest's example) cannot be deleted by its viewers. */
export async function deleteSession(userId: string, id: string) {
  if (isGuestId(userId)) return 0;
  const { count } = await prismadb.session.deleteMany({
    where: { id, userId, pinned: false },
  });
  return count;
}
