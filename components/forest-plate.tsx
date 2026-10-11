import { getImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * The forest at first light (D-004), art-directed: a portrait crop on tall screens, AVIF where
 * the browser takes it. The landing hero, sign-in and the way into the Studio share it, so
 * leaving the landing never leaves the forest.
 */
export function ForestPlate({ className }: { className?: string }) {
  const common = { alt: "", sizes: "100vw", preload: true } as const;
  const {
    props: { srcSet: tall },
  } = getImageProps({
    ...common,
    src: "/landing/forest-tall.jpg",
    width: 1100,
    height: 1834,
  });
  const {
    props: { srcSet: wide, ...rest },
  } = getImageProps({
    ...common,
    src: "/landing/forest.jpg",
    width: 2752,
    height: 1536,
  });
  return (
    <picture>
      <source media="(max-aspect-ratio: 3/4)" srcSet={tall} />
      {/* biome-ignore lint/a11y/useAltText: alt comes from getImageProps, decorative */}
      <img
        {...rest}
        srcSet={wide}
        className={cn(
          "absolute inset-0 size-full object-cover object-[40%_50%]",
          className
        )}
      />
    </picture>
  );
}
