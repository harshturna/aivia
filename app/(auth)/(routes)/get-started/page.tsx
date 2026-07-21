"use client";

import { useEffect, useRef } from "react";

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
const GetStarted = () => {
  const { guestHandler } = useGuestLogin();
  const started = useRef(false);

  useEffect(() => {
    // React 18 StrictMode mounts effects twice in development; without this
    // guard the sign-in fires two requests on every visit.
    if (started.current) return;
    started.current = true;
    guestHandler();
  }, [guestHandler]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader description="Starting your demo session…" />
    </div>
  );
};

export default GetStarted;
