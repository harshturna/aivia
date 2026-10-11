import { Skeleton } from "@/components/ui/skeleton";

/** The lightbox opens at once while its asset loads (TICKET-053). */
export default function LightboxLoading() {
  return (
    <div className="fixed inset-0 z-50 animate-in fade-in-0 duration-150">
      <div className="absolute inset-0 bg-scrim backdrop-blur-sm" />
      <div className="absolute inset-3 grid overflow-hidden rounded-window border border-border bg-bg shadow-float lg:inset-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex items-center justify-center p-10">
          <Skeleton className="aspect-[4/3] w-full max-w-[640px]" />
        </div>
        <div className="hidden border-l border-border bg-surface lg:block" />
      </div>
    </div>
  );
}
