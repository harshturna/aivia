"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { ForestPlate } from "@/components/forest-plate";
import { Button } from "@/components/ui/button";
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
  const { guestHandler, isGuestLoading, guestError } = useGuestLogin();
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

  const retry = () => {
    const query = params.toString();
    guestHandler(`/studio${query ? `?${query}` : ""}`);
  };

  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6">
      <div aria-hidden className="absolute inset-0 -z-10">
        <ForestPlate />
        <div className="absolute inset-0 bg-bg/60" />
      </div>
      {guestError && !isGuestLoading ? (
        // said here, with a retry, rather than a jump to a sign-in page (TICKET-054)
        <div role="alert" className="text-center">
          <p className="font-display text-[clamp(28px,3.4vw,44px)] italic text-fg">
            The Studio did not open
          </p>
          <p className="mt-2 text-[14px] text-fg-2">{guestError}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={retry}>Try again</Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to the home page</Link>
            </Button>
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-4 font-display text-[clamp(28px,3.4vw,44px)] italic text-fg [text-shadow:0_4px_32px_color-mix(in_srgb,var(--color-bg)_70%,transparent)]">
          <Spinner className="size-5" label="Starting" /> Opening the Studio…
        </p>
      )}
    </div>
  );
};

export const GuestStart = () => (
  <Suspense>
    <Start />
  </Suspense>
);
