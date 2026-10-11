"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Opens Stripe: checkout for a free account, the billing portal for Pro. */
export function ManagePlanButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe");
      if (!response.ok) throw new Error("Stripe did not answer");
      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch {
      setError("Could not open billing. Try again in a moment.");
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button onClick={go} disabled={loading}>
        {loading ? "Opening…" : label}
      </Button>
      {error && <p className="mt-2 text-[13px] text-poor">{error}</p>}
    </div>
  );
}
