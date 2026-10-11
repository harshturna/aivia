import { type ContextType, HARD_LIMIT_COUNTS } from "@/constants";
import { getUser } from "./getUser";
import prismadb from "./prismadb";

export const increaseHardLimit = async (context: ContextType, amount = 1) => {
  const user = await getUser(context);
  if (!user) return;
  await prismadb.userApiLimit.upsert({
    where: { userId: user.id },
    update: { hardLimitCount: { increment: amount } },
    create: { userId: user.id, hardLimitCount: amount, count: 0 },
  });
};

export const checkHardLimit = async (context: ContextType) => {
  const user = await getUser(context);

  if (!user) {
    return false;
  }

  const { id: userId } = user;

  const userHardLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId: userId,
    },
  });

  if (userHardLimit === null) {
    return true;
  }

  if (
    userHardLimit?.hardLimitCount === 0 ||
    userHardLimit.hardLimitCount < HARD_LIMIT_COUNTS
  ) {
    return true;
  } else {
    return false;
  }
};

export const getHardLimitCount = async (context: ContextType) => {
  const user = await getUser(context);

  if (!user) {
    return 0;
  }

  const { id: userId } = user;

  const userHardLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });
  if (!userHardLimit) {
    return 0;
  }

  return userHardLimit.hardLimitCount;
};
