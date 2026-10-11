import type { ContextType } from "@/constants";
import { getUser } from "./getUser";
import prismadb from "./prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (context: ContextType) => {
  const user = await getUser(context);
  if (!user) {
    return false;
  }
  const { id: userId } = user;

  if (userId === process.env.GUEST_USER_ID) {
    return true;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const periodEnd = userSubscription.stripeCurrentPeriodEnd?.getTime();
  const isValid =
    Boolean(userSubscription.stripePriceId) &&
    periodEnd !== undefined &&
    periodEnd + DAY_IN_MS > Date.now();

  return isValid;
};
