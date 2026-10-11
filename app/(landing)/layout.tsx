import type { Viewport } from "next";
import { SmoothScroll } from "./_landing/smooth-scroll";

/** The landing wears the forest (D-004, TICKET-031) and glides (TICKET-035). */
// Next needs a literal here; it is the forest theme's --color-bg in app/globals.css
export const viewport: Viewport = { themeColor: "#0b1410" };

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="forest" className="min-h-screen">
      <SmoothScroll />
      {children}
    </div>
  );
}
