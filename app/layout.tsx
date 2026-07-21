import "./globals.css";
import Script from "next/script";
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
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Aivia — an AI studio",
    description:
      "One prompt. Aivia plans it and builds it — images, video, music and code.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The app is dark-only. `dark` is hardcoded rather than applied by
    // next-themes at runtime: no toggle, no system preference, no flash of the
    // wrong theme on first paint, and `color-scheme` keeps native form
    // controls and scrollbars dark to match.
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <Script id="lynq-init" strategy="beforeInteractive">
          {`!function(){"use strict";window.lynq=window.lynq||{track:function(n,e){(window.lynqQueue=window.lynqQueue||[]).push({name:n,properties:e,eventId:crypto.randomUUID()})}}}();`}
        </Script>
        <script
          async
          src="https://cdn.jsdelivr.net/gh/harshturna/lynq-js@v1.0.6/dist/lynq.min.js"
          data-domain="aivia.byharsh.com"
          data-script-id="lynq"
          dangerouslySetInnerHTML={{ __html: "" }}
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
