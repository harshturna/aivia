"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useGuestLogin } from "@/hooks/useGuestLogin";
import { OpeningBackdrop, OpeningMessage } from "./opening";

/**
 * The landing's way in: starts a guest session and opens the Studio, carrying a prompt
 * typed on the landing page. The page hands it the Studio's address, so it needs no
 * search params and renders on the server at once (TICKET-082).
 *
 * Sign-in goes through useGuestLogin, which posts to /api/auth/guest and reads
 * the credentials from server-side env. The previous version called Supabase
 * directly with NEXT_PUBLIC_GUEST_EMAIL / NEXT_PUBLIC_GUEST_PASSWORD, which
 * shipped the shared demo password to every visitor in the client bundle.
 */
export function GuestStart({ next }: { next: string }) {
  const { guestHandler, isGuestLoading, guestError } = useGuestLogin();
  const started = useRef(false);

  useEffect(() => {
    // StrictMode mounts effects twice in development; without this guard the
    // sign-in fires two requests on every visit.
    if (started.current) return;
    started.current = true;
    guestHandler(next);
  }, [guestHandler, next]);

  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6">
      <OpeningBackdrop />
      {guestError && !isGuestLoading ? (
        // said here, with a retry, rather than a jump to a sign-in page (TICKET-054)
        <div role="alert" className="text-center">
          <p className="font-display text-[clamp(28px,3.4vw,44px)] italic text-fg">
            The Studio did not open
          </p>
          <p className="mt-2 text-[14px] text-fg-2">{guestError}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => guestHandler(next)}>Try again</Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to the home page</Link>
            </Button>
          </div>
        </div>
      ) : (
        <OpeningMessage />
      )}
    </div>
  );
}
