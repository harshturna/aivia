import "./globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { ModalProvider } from "@/components/ModalProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

// Body text. `variable` rather than `className` so display type can coexist.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Display face for headings and the wordmark. Inter alone is the single most
// recognisable "generic AI product" tell; a distinct display face is the
// cheapest way to stop reading as a template.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#101014" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is required by next-themes: it sets the theme
    // class on <html> before React hydrates, which would otherwise mismatch.
    <html lang="en" suppressHydrationWarning>
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
        className={`${inter.variable} ${display.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider />
          <ToasterProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
