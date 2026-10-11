import { ScreenHeader } from "@/components/shell/screen";
import { Skeleton } from "@/components/ui/skeleton";

/** The library loads as a grid, not as a Studio run (design §13, TICKET-053). */
export default function LibraryLoading() {
  const shapes = [
    "aspect-[3/4]",
    "aspect-video",
    "aspect-square",
    "aspect-[3/4]",
  ];
  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Library" />
      <div className="px-3 pt-4 lg:px-6">
        <Skeleton className="h-8 w-64 rounded-control" />
      </div>
      <div className="columns-2 gap-2 px-3 pt-6 md:columns-3 lg:px-6 xl:columns-4">
        {[...shapes, ...shapes].map((shape, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders are positional
          <Skeleton key={i} className={`mb-2 ${shape}`} />
        ))}
      </div>
    </div>
  );
}
