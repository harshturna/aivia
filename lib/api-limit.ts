import { type ContextType, MAX_FREE_COUNTS } from "@/constants";
import { getUser } from "./getUser";
import prismadb from "./prismadb";

export const increaseApiLimit = async (context: ContextType, amount = 1) => {
  const user = await getUser(context);
  if (!user) return;
  // One atomic statement: two runs finishing together cannot both read the old count.
  await prismadb.userApiLimit.upsert({
    where: { userId: user.id },
    update: { count: { increment: amount } },
    create: { userId: user.id, count: amount },
  });
};

/** True when `cost` more generations still fit in the free allowance. */
export const checkApiLimit = async (context: ContextType, cost = 1) => {
  const user = await getUser(context);

  if (!user) {
    return false;
  }

  const { id: userId } = user;

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!userApiLimit || userApiLimit.count + cost <= MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

export const getApiLimitCount = async (context: ContextType) => {
  const user = await getUser(context);

  if (!user) {
    return 0;
  }

  const { id: userId } = user;

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });
  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};
