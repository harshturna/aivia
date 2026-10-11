"use client";

import { useState } from "react";
import { userProModal } from "@/hooks/useProModal";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

/**
 * The upgrade dialog (design §5.5): what Pro is in plain words, the price, two buttons.
 * Opened from the credits meter and from a generation that hit the free limit.
 */
const ProModal = () => {
  const proModal = userProModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe");
      if (!response.ok) throw new Error("Stripe did not answer");
      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch {
      setError("Could not open checkout. Try again in a moment.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-medium tracking-[-0.01em]">
            Aivia Pro
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-6 text-fg-2">
            Unlimited generations in every mode, for $20 a month. Cancel any
            time from Settings.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-[13px] text-poor">{error}</p>}
        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={subscribe} disabled={loading}>
            {loading ? "Opening…" : "Continue to checkout"}
          </Button>
          <Button variant="ghost" onClick={proModal.onClose}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;
