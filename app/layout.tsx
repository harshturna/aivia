import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cormorant, Host_Grotesk, JetBrains_Mono } from "next/font/google";
import { ModalProvider } from "@/components/ModalProvider";
import { OneSound } from "@/components/one-sound";
import { ToasterProvider } from "@/components/ToasterProvider";

/** Host Grotesk for the interface, Cormorant for display (D-004); the mono is for code only. */
const host = Host_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-host",
});
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://aivia.byharsh.com";
const TITLE = "Aivia";
const TAGLINE = "Describe it. Watch it get made.";
const DESCRIPTION =
  "One line of text becomes images, video, music and sound. Aivia plans the work and makes it while you watch.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: `${TITLE}: ${TAGLINE}`, template: `%s | ${TITLE}` },
  description: DESCRIPTION,
  applicationName: TITLE,
  openGraph: {
    type: "website",
    siteName: TITLE,
    title: `${TITLE}: ${TAGLINE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE}: ${TAGLINE}`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${host.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Lynq analytics: one deferred tag, no cookies. docs-lynq.byharsh.com/install/nextjs */}
        <script
          defer
          src="https://lynq.byharsh.com/js/lynq.js"
          data-site="aivia.byharsh.com"
          data-vitals=""
          data-outbound=""
          data-a11y=""
        />
      </head>
      <body className="font-sans antialiased">
        <OneSound />
        <ModalProvider />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
