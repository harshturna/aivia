import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SIDEBAR_COOKIE } from "@/components/shell/constants";
import { Shell } from "@/components/shell/shell";
import { MAX_FREE_COUNTS } from "@/constants";
import { getApiLimitCount } from "@/lib/api-limit";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { checkSubscription } from "@/lib/subscription";

/**
 * One layout for every signed-in route (design §4, D-002). Reads the sidebar's collapsed
 * state from its cookie so the first paint is right.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser("SERVER_COMPONENT");
  if (!user) redirect("/login");

  const [count, isPro, isGuest, cookieStore] = await Promise.all([
    getApiLimitCount("SERVER_COMPONENT"),
    checkSubscription("SERVER_COMPONENT"),
    isGuestUser("SERVER_COMPONENT"),
    cookies(),
  ]);

  const email = user.email ?? null;
  const name = isGuest
    ? "Guest"
    : ((user.user_metadata?.name as string | undefined) ??
      email?.split("@")[0] ??
      "You");

  return (
    <Shell
      user={{ name, email, isGuest, isPro }}
      usage={{ count, max: MAX_FREE_COUNTS }}
      collapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"}
    >
      {children}
    </Shell>
  );
}
