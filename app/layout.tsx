import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ModalProvider } from "@/components/ModalProvider";
import { ToasterProvider } from "@/components/ToasterProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aivia",
  description: "Your AI suite",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script id="lynq-init" strategy="beforeInteractive">
          {`!function(){"use strict";window.lynq=window.lynq||{track:function(n,e){(window.lynqQueue=window.lynqQueue||[]).push({name:n,properties:e,eventId:crypto.randomUUID()})}}}();`}
        </Script>
        <script
          async
          src="https://cdn.jsdelivr.net/gh/harshturna/lynq-js@v1.0.5/dist/lynq.min.js"
          data-domain="aivia.byharsh.com"
          data-script-id="lynq"
          dangerouslySetInnerHTML={{ __html: "" }}
        />
      </head>
      <body className={inter.className}>
        <ModalProvider />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
