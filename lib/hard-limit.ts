import { getUser } from "./getUser";
import prismadb from "./prismadb";
import { HARD_LIMIT_COUNTS, ContextType } from "@/constants";

export const increaseHardLimit = async (context: ContextType) => {
  const user = await getUser(context);
  if (!user) {
    return;
  }
  const { id: userId } = user;
  const userHardLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });
  if (userHardLimit) {
    await prismadb.userApiLimit.update({
      where: {
        userId: userId,
      },
      data: { hardLimitCount: userHardLimit.hardLimitCount + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { hardLimitCount: 1, userId: userId, count: 1 },
    });
  }
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
