"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { Loader } from "@/components/Loader";
import { useGuestLogin } from "@/hooks/useGuestLogin";

/**
 * Landing CTA target: starts a demo session and forwards to the dashboard.
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
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader description="Starting your demo session…" />
    </div>
  );
};

const GetStarted = () => (
  <Suspense>
    <Start />
  </Suspense>
);

export default GetStarted;
