import type { Metadata } from "next";
import { EditorDemo } from "./_landing/editor-demo";
import { Hero } from "./_landing/hero";
import { LandingNav } from "./_landing/nav";
import { Close, LandingFooter, Modes } from "./_landing/sections";
import { StudioDemo } from "./_landing/studio-demo";
import { Wall } from "./_landing/wall";
import { YourTurn } from "./_landing/your-turn";

export const metadata: Metadata = {
  title: { absolute: "Aivia: Describe it. Watch it get made." },
  alternates: { canonical: "/" },
};

/**
 * Below the fold the browser skips layout and paint until a section comes near. Each guess is
 * close to the section's real height, so the page does not shrink as they render (TICKET-055).
 */
const LATER = "[content-visibility:auto]";

/** The landing page (design §11, D-004): one sentence unfolding, then the proof. */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg">
      <LandingNav />
      <main id="main" tabIndex={-1} className="space-y-40 outline-none">
        <Hero />
        <YourTurn />
        <div className={`${LATER} [contain-intrinsic-size:auto_1200px]`}>
          <Wall />
        </div>
        <div className={`${LATER} [contain-intrinsic-size:auto_960px]`}>
          <StudioDemo />
        </div>
        <div className={`${LATER} [contain-intrinsic-size:auto_840px]`}>
          <EditorDemo />
        </div>
        <div className={`${LATER} [contain-intrinsic-size:auto_900px]`}>
          <Modes />
        </div>
        <Close />
      </main>
      <LandingFooter />
    </div>
  );
}
