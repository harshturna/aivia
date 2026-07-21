"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Starts a shared demo session.
 *
 * The credentials stay on the server (see app/api/auth/guest/route.ts); this
 * only asks for a session and lets the cookie come back with the response.
 */
export function useGuestLogin() {
  const router = useRouter();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const guestHandler = async () => {
    setIsGuestLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      router.refresh();
      router.push("/dashboard");
    } catch {
      router.push("/login");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return { guestHandler, isGuestLoading };
}
