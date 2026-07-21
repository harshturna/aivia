import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const includedFeatures = [
  "Unlimited access to all features",
  "Priority support",
  "Early access to new features",
  "Faster resource generation",
];

/**
 * The previous version was Tailwind UI's stock section verbatim, styled with
 * raw gray-* classes that ignored the token system, two invalid classes
 * (text-black-600, hover:bg-black-500 — neither exists, so the checkmarks
 * inherited colour and the CTA had no hover state), an empty <p> emitting
 * dead space, and "Reccured" in shipped copy.
 */
export default function Pricing() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Monthly subscription, cancel anytime
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            No strings attached — one monthly subscription, unlimited access to
            every tool.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-[1000px] rounded-2xl border border-border bg-card sm:mt-20 lg:flex">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Aivia Pro
            </h3>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-primary">
                What&apos;s included
              </h4>
              <div className="h-px flex-auto bg-border" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-xl bg-muted py-10 text-center lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-muted-foreground">
                  Recurring monthly, unlimited use
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="font-display text-5xl font-semibold tracking-tight">
                    $20
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    USD
                  </span>
                </p>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ size: "lg" }), "mt-10 w-full")}
                >
                  Get access
                </Link>
                <p className="mt-6 text-xs leading-5 text-muted-foreground">
                  Invoices and receipts are available in your Stripe account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
