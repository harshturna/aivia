"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";

/** The character's portrait (design §8): a 4:5 frame that opens the uploader. */
export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}) => {
  const frame = (
    <span className="relative flex aspect-[4/5] w-40 items-center justify-center overflow-hidden rounded-media border border-dashed border-border-strong bg-surface transition-colors group-hover:border-fg-2">
      {value ? (
        <Image
          src={value}
          alt="The portrait"
          fill
          sizes="160px"
          className="object-cover"
        />
      ) : (
        <span className="flex flex-col items-center gap-2 text-[12.5px] text-mute">
          <ImagePlus className="size-5" />
          Add a portrait
        </span>
      )}
    </span>
  );
  // The upload button takes no disabled state; a guest or a save in flight sees the frame.
  if (disabled)
    return (
      <div className="w-40 cursor-not-allowed" aria-disabled="true">
        {frame}
      </div>
    );
  return (
    <CldUploadButton
      onSuccess={(result) => {
        const info = result.info as { secure_url?: string } | undefined;
        if (info?.secure_url) onChange(info.secure_url);
      }}
      options={{ maxFiles: 1, resourceType: "image" }}
      uploadPreset="dh2qlatf"
      className="group block w-40 rounded-media"
    >
      {frame}
    </CldUploadButton>
  );
};
