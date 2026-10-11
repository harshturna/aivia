"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGuestLogin } from "@/hooks/useGuestLogin";

/**
 * The landing's way in: starts a guest session and opens the Studio, carrying a prompt
 * typed on the landing page.
 *
 * Sign-in goes through useGuestLogin, which posts to /api/auth/guest and reads
 * the credentials from server-side env. The previous version called Supabase
 * directly with NEXT_PUBLIC_GUEST_EMAIL / NEXT_PUBLIC_GUEST_PASSWORD, which
 * shipped the shared demo password to every visitor in the client bundle.
 */
const Start = () => {
  const { guestHandler } = useGuestLogin();
  const params = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    // StrictMode mounts effects twice in development; without this guard the
    // sign-in fires two requests on every visit.
    if (started.current) return;
    started.current = true;
    // A prompt typed on the landing page rides along into the Studio.
    const next = new URLSearchParams();
    const prompt = params.get("prompt");
    const mode = params.get("mode");
    if (prompt) next.set("prompt", prompt);
    if (mode) next.set("mode", mode);
    const query = next.toString();
    guestHandler(`/studio${query ? `?${query}` : ""}`);
  }, [guestHandler, params]);

  return (
    <div className="grid min-h-dvh place-items-center">
      <p className="flex items-center gap-2.5 text-[14px] text-fg-2">
        <Spinner className="size-4" label="Starting" /> Opening the Studio…
      </p>
    </div>
  );
};

export const GuestStart = () => (
  <Suspense>
    <Start />
  </Suspense>
);
