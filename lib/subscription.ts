import { auth } from "@clerk/nextjs";
import { getUser } from "./getUser";
import prismadb from "./prismadb";
import { ContextType } from "@/constants";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (context: ContextType) => {
  const user = await getUser(context);
  if (!user) {
    return false;
  }
  const { id: userId } = user;

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

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  return !!isValid;
};
