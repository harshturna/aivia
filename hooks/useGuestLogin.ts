"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Starts a shared demo session.
 *
 * The credentials stay on the server (see app/api/auth/guest/route.ts); this
 * only asks for a session and lets the cookie come back with the response.
 */
export function useGuestLogin() {
  const router = useRouter();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  // a failed start is said where it happened, with a retry, instead of a silent jump to a
  // sign-in page that says "Welcome back" (TICKET-054)
  const [guestError, setGuestError] = useState<string | null>(null);

  const guestHandler = async (next: string = "/studio") => {
    setIsGuestLoading(true);
    setGuestError(null);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) {
        setGuestError(
          "The guest session did not start. Try again in a moment."
        );
        return;
      }
      router.refresh();
      router.push(next);
    } catch {
      setGuestError("The connection dropped. Check it and try again.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return { guestHandler, isGuestLoading, guestError };
}
