import type { Viewport } from "next";

/** The landing (D-004): the theme and the display face are the app's defaults now. */
export const viewport: Viewport = { themeColor: "#0b1410" };

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
