import type { ContextType } from "@/constants";
import { getUser } from "./getUser";

export async function isGuestUser(context: ContextType) {
  const user = await getUser(context);
  if (!user) return false;
  return user.id === process.env.GUEST_USER_ID;
}

export function getGuestUser() {
  return process.env.GUEST_USER_ID;
}

/**
 * The shared guest account (TICKET-038): every visitor signs in as it, so nothing a guest makes
 * is stored, and a guest only ever reads the pinned examples.
 */
export function isGuestId(userId: string | null | undefined) {
  const guest = process.env.GUEST_USER_ID;
  return Boolean(guest && userId === guest);
}
