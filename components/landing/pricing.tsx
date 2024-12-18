import { Check } from "lucide-react";
import Link from "next/link";

const includedFeatures = [
  "Unlimited access to all features",
  "Priority support",
  "Early access to new features",
  "Faster resource generation",
];

export default function Pricing() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Monthly subscription, cancel anytime!
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            There are no strings attached with our services, you pay a monthly
            subscription and get unlimited access to all our AI tools. <br />{" "}
            Cancel anytime!
          </p>
        </div>
        <div className="mt-16 max-w-[1000px] mx-auto rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-auto lg:flex">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Worth every penny!
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600"></p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-black">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-black-600"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  Reccured monthly for unlimited use
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    $20
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    USD
                  </span>
                </p>
                <Link
                  href="/login"
                  className="mt-10 block w-full rounded-md bg-black px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-black-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Get access
                </Link>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts will be available in your stripe
                  account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
