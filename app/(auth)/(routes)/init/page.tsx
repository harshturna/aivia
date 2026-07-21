"use client";

import { useEffect, useRef } from "react";

import { Loader } from "@/components/Loader";
import { useGuestLogin } from "@/hooks/useGuestLogin";

/**
 * Landing CTA target: starts a demo session and forwards to the dashboard.
 */
const Init = () => {
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

export default Init;
