import type { Metadata } from "next";
import Link from "next/link";
import { ScreenBody, ScreenHeader } from "@/components/shell/screen";
import { buttonVariants } from "@/components/ui/button";
import { MAX_FREE_COUNTS } from "@/constants";
import { getApiLimitCount } from "@/lib/api-limit";
import { getUser } from "@/lib/getUser";
import { isGuestUser } from "@/lib/guest-user";
import { checkSubscription } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { ManagePlanButton } from "./manage-plan-button";

export const metadata: Metadata = { title: "Settings" };

/** Settings (design §9): account, plan, in one column. */
export default async function SettingsPage() {
  const [user, isPro, isGuest, count] = await Promise.all([
    getUser("SERVER_COMPONENT"),
    checkSubscription("SERVER_COMPONENT"),
    isGuestUser("SERVER_COMPONENT"),
    getApiLimitCount("SERVER_COMPONENT"),
  ]);

  return (
    <div>
      <ScreenHeader title="Settings" />
      <ScreenBody className="mx-auto max-w-[640px] space-y-12 py-10">
        <section>
          <h2 className="text-[13px] font-medium text-fg-2">Account</h2>
          <div className="mt-3 rounded-panel border border-border bg-surface p-5">
            {isGuest ? (
              <>
                <p className="text-[15px]">Guest session</p>
                <p className="mt-1 text-[13px] leading-5 text-mute">
                  Everything you make here is shared with every other guest and
                  cleared after a week. Sign up to keep your work to yourself.
                </p>
                <Link href="/signup" className={cn(buttonVariants(), "mt-4")}>
                  Create an account
                </Link>
              </>
            ) : (
              <>
                <p className="text-[15px]">{user?.email}</p>
                <p className="mt-1 text-[13px] text-mute">
                  Signed in with email and password.
                </p>
              </>
            )}
          </div>
        </section>

        <section id="plan">
          <h2 className="text-[13px] font-medium text-fg-2">Plan</h2>
          <div className="mt-3 rounded-panel border border-border bg-surface p-5">
            {isGuest ? (
              <p className="text-[15px]">
                The guest session runs on a shared daily allowance.
              </p>
            ) : isPro ? (
              <>
                <p className="text-[15px]">Pro</p>
                <p className="mt-1 text-[13px] text-mute">
                  Unlimited generations. Invoices and the subscription are in
                  the billing portal.
                </p>
                <ManagePlanButton
                  label="Manage subscription"
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <p className="text-[15px]">Free</p>
                <p className="tabular mt-1 text-[13px] text-mute">
                  {Math.min(count, MAX_FREE_COUNTS)} of {MAX_FREE_COUNTS} free
                  generations used.
                </p>
                <ManagePlanButton label="Upgrade to Pro" className="mt-4" />
              </>
            )}
          </div>
        </section>
      </ScreenBody>
    </div>
  );
}
