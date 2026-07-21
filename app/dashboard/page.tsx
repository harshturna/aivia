import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { offerings } from "@/constants";
import { Card } from "@/components/ui/card";

/**
 * Tool picker.
 *
 * The Documents AI entry used to be special-cased into a disabled card with a
 * "Coming Soon!" tooltip. It ships now, so every offering is a plain link and
 * the branch is gone — along with the text-gray-300 description it rendered,
 * which sat at roughly 1.6:1 contrast on white.
 */
const Dashboard = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 lg:px-20 xl:px-40">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
          Explore our <span className="text-primary">tools</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start in the Studio, or drive any tool directly.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-3">
        {offerings.map((tool) => (
          <Link
            href={tool.href}
            key={tool.href}
            className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="flex items-center gap-5 p-4 transition-colors group-hover:border-primary/40">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tool.bgColor}`}
              >
                <tool.icon
                  className={`h-6 w-6 ${tool.color}`}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold">{tool.label}</div>
                <div className="text-sm text-muted-foreground">
                  {tool.description}
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden="true"
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
