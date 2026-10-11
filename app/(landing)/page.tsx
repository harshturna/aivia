import type { Metadata } from "next";
import { Hero } from "./_landing/hero";
import { LandingNav } from "./_landing/nav";
import { Close, LandingFooter, Modes, Pricing } from "./_landing/sections";
import { StudioDemo } from "./_landing/studio-demo";
import { Wall } from "./_landing/wall";
import { YourTurn } from "./_landing/your-turn";

export const metadata: Metadata = {
  title: { absolute: "Aivia: Describe it. Watch it get made." },
  alternates: { canonical: "/" },
};

/** Below the fold the browser skips layout and paint until a section comes near. */
const LATER = "[content-visibility:auto] [contain-intrinsic-size:auto_960px]";

/** The landing page (design §11, D-004): one sentence unfolding, then the proof. */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg">
      <LandingNav />
      <main id="main" className="space-y-40">
        <Hero />
        <YourTurn />
        <div className={LATER}>
          <Wall />
        </div>
        <div className={LATER}>
          <StudioDemo />
        </div>
        <div className={LATER}>
          <Modes />
        </div>
        <div className={LATER}>
          <Pricing />
        </div>
        <Close />
      </main>
      <LandingFooter />
    </div>
  );
}
