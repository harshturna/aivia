import { features } from "@/config/contents";

/**
 * Replaces two stacked sections (FeatureCards + Features) that showed the same
 * three lucide icons twice in a row, ~200px apart, in two different visual
 * treatments — plus fixed-size 280px squares with conflicting md:w-* classes.
 */
export default function Features() {
  return (
    <section id="features" className="w-full bg-muted/50 py-16 md:py-24">
      <div className="container">
        <h2 className="mb-4 text-center font-display text-3xl font-semibold tracking-tight">
          {features.header}
        </h2>
        <p className="mx-auto mb-12 max-w-md text-center text-muted-foreground">
          {features.subheader}
        </p>
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.content.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.text}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent p-2.5 text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 font-display text-lg font-semibold">
                  {feature.text}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
