import type { Metadata } from "next";
import { Hero } from "./_landing/hero";
import { LandingNav } from "./_landing/nav";
import {
  Changelog,
  Close,
  LandingFooter,
  LibraryPanel,
  Modes,
  Pricing,
} from "./_landing/sections";
import { StudioDemo } from "./_landing/studio-demo";
import { Wall } from "./_landing/wall";

export const metadata: Metadata = {
  title: { absolute: "Aivia: Describe it. Watch it get made." },
  alternates: { canonical: "/" },
};

/** The landing page (design §11, D-003): dark, the generated media is the page. */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg">
      <LandingNav />
      <main id="main" className="space-y-32">
        <Hero />
        <Wall />
        <StudioDemo />
        <Modes />
        <LibraryPanel />
        <Pricing />
        <Changelog />
        <Close />
      </main>
      <LandingFooter />
    </div>
  );
}
