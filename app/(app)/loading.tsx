import { Skeleton } from "@/components/ui/skeleton";

/** The route-level fallback (design §13): the header's shape and a column of placeholders. */
export default function Loading() {
  return (
    <div>
      <div className="flex h-13 items-center border-b border-border px-6">
        <Skeleton className="h-4 w-40 rounded-control" />
      </div>
      <div className="mx-auto max-w-[760px] space-y-4 px-6 py-8">
        <Skeleton className="h-4 w-2/3 rounded-control" />
        <Skeleton className="h-4 w-1/3 rounded-control" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-video" />
        </div>
      </div>
    </div>
  );
}
