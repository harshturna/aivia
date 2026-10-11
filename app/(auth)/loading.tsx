import { ForestPlate } from "@/components/forest-plate";
import { Spinner } from "@/components/ui/spinner";

/** Between sign-in and sign-up the forest stays; only the card waits (TICKET-054). */
export default function Loading() {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <ForestPlate />
        <div className="absolute inset-0 bg-bg/70" />
      </div>
      <Spinner className="size-5" label="Loading" />
    </div>
  );
}
