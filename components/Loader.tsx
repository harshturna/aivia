import { TypingDots } from "./TypingDots";

interface LoaderProps {
  description?: string;
}

export const Loader = ({ description }: LoaderProps) => (
  <div className="flex h-full flex-col items-center gap-y-3">
    <TypingDots className="text-primary" />
    <p className="text-sm text-muted-foreground">
      {description ?? "Aivia is thinking…"}
    </p>
  </div>
);
