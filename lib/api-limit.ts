import { getUser } from "./getUser";
import prismadb from "./prismadb";
import { MAX_FREE_COUNTS, ContextType } from "@/constants";

export const increaseApiLimit = async (context: ContextType) => {
  const user = await getUser(context);
  if (!user) {
    return;
  }
  const { id: userId } = user;
  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });
  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: {
        userId: userId,
      },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { count: 1, userId: userId },
    });
  }
};

export const checkApiLimit = async (context: ContextType) => {
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

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
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
