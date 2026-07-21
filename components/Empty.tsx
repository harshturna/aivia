import Image from "next/image";

interface EmptyProps {
  label: string;
}

export const Empty = ({ label }: EmptyProps) => {
  return (
    <div className="flex h-full flex-col items-center p-12">
      {/* Local asset; previously a hardcoded Cloudinary URL for the same file.
          sizes keeps next/image from serving the 2160px original for a 224px
          slot. dark:invert because the illustration is black-on-transparent. */}
      <div className="relative h-56 w-56 opacity-80 dark:invert">
        <Image alt="" fill sizes="224px" src="/empty.png" />
      </div>
      <p className="text-center text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
