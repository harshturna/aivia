import type { Viewport } from "next";
import { Cormorant } from "next/font/google";

/** The display face (D-004), one weight in two styles, and the forest theme for the landing. */
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#0b1410" };

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="forest" className={`${cormorant.variable} min-h-screen`}>
      {children}
    </div>
  );
}
