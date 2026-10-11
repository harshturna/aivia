import {
  Archivo,
  Bricolage_Grotesque,
  Cormorant,
  DM_Mono,
} from "next/font/google";

/** Fonts for the direction studies (TICKET-020); each page uses its own. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-bricolage",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = { robots: { index: false } };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${archivo.variable} ${bricolage.variable} ${dmMono.variable} ${cormorant.variable}`}
    >
      {children}
    </div>
  );
}
