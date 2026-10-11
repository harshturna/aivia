import { Cormorant } from "next/font/google";

/** The display face for the direction study (TICKET-020, D-004). */
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = { robots: { index: false } };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={cormorant.variable}>{children}</div>;
}
