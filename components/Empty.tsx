import Image from "next/image";

interface EmptyProps {
  label: string;
}

export const Empty = ({ label }: EmptyProps) => {
  return (
    <div className="h-full p-20 flex flex-col items-center">
      <div className="relative h-72 w-72">
        <Image alt="Empty" fill src="https://res.cloudinary.com/dlp6wui7r/image/upload/v1706318362/aivia/empty.png" />
      </div>
      <p className="text-muted-foreground text-sm text-center capitalize">
        {label}
      </p>
    </div>
  );
};
