import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/getUser";
import { GuestStart } from "./guest-start";

export const metadata: Metadata = { title: "Opening the Studio" };

/**
 * The landing's way in. A visitor who is already signed in goes straight to the Studio with
 * the prompt they typed; anyone else gets a guest session first (GuestStart).
 */
export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; mode?: string; send?: string }>;
}) {
  const user = await getUser("SERVER_COMPONENT");
  const { prompt, mode, send } = await searchParams;
  const next = new URLSearchParams();
  if (prompt) next.set("prompt", prompt);
  if (mode) next.set("mode", mode);
  if (send === "1" && prompt) next.set("send", "1");
  const query = next.toString();
  const studio = `/studio${query ? `?${query}` : ""}`;
  if (user) redirect(studio);
  // the address comes from here, so the screen renders on the server at once (TICKET-082)
  return <GuestStart next={studio} />;
}
