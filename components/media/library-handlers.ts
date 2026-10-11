"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { MediaItem } from "@/lib/media";
import type { MediaHandlers } from "./actions";

/**
 * The actions of a piece seen outside its project (the Library, the lightbox): the ones that
 * make something new open the Studio with the piece (TICKET-063).
 */
export function useLibraryHandlers({
  favourite,
  open,
}: {
  favourite?: (item: MediaItem) => void;
  open?: (item: MediaItem) => void;
}): MediaHandlers {
  const router = useRouter();
  return useMemo(
    () => ({
      open,
      edit: (item) =>
        item.assetId && router.push(`/edit?asset=${item.assetId}`),
      animate: (item) =>
        item.assetId && router.push(`/studio?animate=${item.assetId}`),
      attachToBrief: (item) =>
        item.assetId && router.push(`/studio?ref=${item.assetId}`),
      reusePrompt: (item) =>
        router.push(`/studio?prompt=${encodeURIComponent(item.prompt)}`),
      favourite,
    }),
    [router, favourite, open]
  );
}
