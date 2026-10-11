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
  if (user) {
    const { prompt, mode, send } = await searchParams;
    const next = new URLSearchParams();
    if (prompt) next.set("prompt", prompt);
    if (mode) next.set("mode", mode);
    if (send === "1" && prompt) next.set("send", "1");
    const query = next.toString();
    redirect(`/studio${query ? `?${query}` : ""}`);
  }
  return <GuestStart />;
}
