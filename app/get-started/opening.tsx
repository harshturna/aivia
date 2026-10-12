import { ForestPlate } from "@/components/forest-plate";
import { Spinner } from "@/components/ui/spinner";

/**
 * The way into the Studio, as it first paints (TICKET-082): the forest and "Opening the Studio…",
 * from the server, so pressing Start making never shows an empty screen.
 */
export function OpeningBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <ForestPlate />
      <div className="absolute inset-0 bg-bg/60" />
    </div>
  );
}

export function OpeningMessage() {
  return (
    <p className="flex items-center gap-4 font-display text-[clamp(28px,3.4vw,44px)] italic text-fg [text-shadow:0_4px_32px_color-mix(in_srgb,var(--color-bg)_70%,transparent)]">
      <Spinner className="size-5" label="Starting" /> Opening the Studio…
    </p>
  );
}

export function Opening() {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6">
      <OpeningBackdrop />
      <OpeningMessage />
    </div>
  );
}
