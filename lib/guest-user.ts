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
