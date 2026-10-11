import type { Viewport } from "next";

/** The landing wears the forest (D-004, TICKET-031); the app around it stays neutral. */
export const viewport: Viewport = { themeColor: "#0b1410" };

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="forest" className="min-h-screen">
      {children}
    </div>
  );
}
