import { MenuButton } from "@/components/shell/menu-button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The route-level fallback (design §13): the header's shape and a few neutral lines, not a
 * Studio run, since any screen can be loading (TICKET-054). It is a screen header, so the
 * phone's own bar steps aside as it does for a loaded screen.
 */
export default function Loading() {
  return (
    <div>
      <div
        data-screen-header
        className="flex h-13 items-center gap-3 border-b border-transparent px-3 lg:px-6"
      >
        <MenuButton />
        <Skeleton className="h-4 w-40 rounded-control" />
      </div>
      <div className="mx-auto max-w-[760px] space-y-3 px-6 py-8">
        <Skeleton className="h-4 w-2/3 rounded-control" />
        <Skeleton className="h-4 w-1/2 rounded-control" />
        <Skeleton className="h-4 w-1/3 rounded-control" />
      </div>
    </div>
  );
}
