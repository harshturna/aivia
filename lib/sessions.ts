import type { Prisma, Session } from "@prisma/client";
import type { UIMessage } from "ai";
import prismadb from "@/lib/prismadb";

export { isSessionId, messageText, titleFromBrief } from "@/lib/session-text";

/**
 * Sessions (design §12): a Studio conversation, its messages as the AI SDK's UIMessage[]
 * in one JSON column. Every read and write is scoped by the owner's user id; a row that is
 * not the caller's reads as absent.
 */
export const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;

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

/** The guest account is shared, so a guest sees only the last day's sessions. */
export async function listSessions(
  userId: string,
  { limit = 8, isGuest = false }: { limit?: number; isGuest?: boolean } = {}
): Promise<SessionSummary[]> {
  return prismadb.session.findMany({
    where: {
      userId,
      ...(isGuest
        ? {
            OR: [
              { pinned: true },
              { updatedAt: { gte: new Date(Date.now() - GUEST_WINDOW_MS) } },
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: summary,
  });
}

export async function getSession(userId: string, id: string) {
  const session = await prismadb.session.findFirst({ where: { id, userId } });
  if (!session) return null;
  return {
    ...session,
    messages: (session.messages as unknown as UIMessage[]) ?? [],
  };
}

/** Creates the row if the id is new to this user; the client makes the id up front. */
export async function ensureSession(
  userId: string,
  id: string,
  mode = "auto"
): Promise<Session> {
  const existing = await prismadb.session.findFirst({ where: { id, userId } });
  if (existing) return existing;
  return prismadb.session.create({ data: { id, userId, mode } });
}

export async function saveMessages(
  userId: string,
  id: string,
  messages: UIMessage[]
) {
  await prismadb.session.updateMany({
    where: { id, userId },
    data: { messages: messages as unknown as Prisma.InputJsonValue },
  });
}

export async function renameSession(userId: string, id: string, title: string) {
  const clean = title.trim().slice(0, 80);
  if (!clean) return 0;
  const { count } = await prismadb.session.updateMany({
    where: { id, userId },
    data: { title: clean },
  });
  return count;
}

/** A pinned session (the guest's example) cannot be deleted by its viewers. */
export async function deleteSession(userId: string, id: string) {
  const { count } = await prismadb.session.deleteMany({
    where: { id, userId, pinned: false },
  });
  return count;
}
