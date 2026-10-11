import type { ContextType } from "@/constants";
import { getUser } from "./getUser";
import prismadb from "./prismadb";

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
