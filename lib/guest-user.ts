import { getUser } from "./getUser";
import { ContextType } from "@/constants";

export async function isGuestUser(context: ContextType) {
  const user = await getUser(context);
  if (!user) return false;
  return user.id === process.env.GUEST_USER_ID;
}

export function getGuestUser() {
  return process.env.GUEST_USER_ID;
}
