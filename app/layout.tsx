import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { ModalProvider } from "@/components/ModalProvider";
import { ToasterProvider } from "@/components/ToasterProvider";

// Montserrat carries both roles. It is bound to --font-display as well as
// --font-sans so the existing `font-display` headings keep working; the
// distinction is now weight and tracking rather than a second family.
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://aivia.byharsh.com"),
  title: {
    default: "Aivia — an AI studio",
    template: "%s · Aivia",
  },
  description:
    "One prompt. Aivia plans it and builds it — images, video, music and code.",
  // No `icons` entry: app/icon.svg is picked up by the App Router convention
  // and the <link> tags are generated automatically. The previous value
  // pointed at /favicon.ico, which does not exist in this repo — the app has
  // been serving a 404 for its icon.
  openGraph: {
    title: "Aivia — an AI studio",
    description:
      "One prompt. Aivia plans it and builds it — images, video, music and code.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The app is light-only: no toggle, no system preference, no flash of the
    // wrong theme on first paint. `color-scheme` pins native form controls and
    // scrollbars to light so they cannot follow the OS setting.
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        {/* Lynq analytics: one deferred tag, no cookies. docs-lynq.byharsh.com/install/nextjs */}
        <script
          defer
          src="https://lynq.byharsh.com/js/lynq.js"
          data-site="aivia.byharsh.com"
          data-vitals=""
          data-outbound=""
        />
      </head>
      <body
        className={`${montserrat.variable} font-sans antialiased`}
        style={{ "--font-display": "var(--font-sans)" } as React.CSSProperties}
      >
        <ModalProvider />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
