"use server";
import { checkHardLimit, increaseHardLimit } from "@/lib/hard-limit";

export async function didLimitReach() {
  const hardLimitNotReached = await checkHardLimit("ROUTE_HANDLER");

  if (!hardLimitNotReached) {
    return true;
  }

  return false;
}

export async function incrementLimit() {
  await increaseHardLimit("SERVER_COMPONENT");
}
