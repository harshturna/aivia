import { Sparkle } from "lucide-react";

interface LoaderProps {
  description?: string;
}

export const Loader = ({ description }: LoaderProps) => (
  <div className="h-full flex flex-col gap-y-4 items-center">
    <div className="text-slate-600/80 flex gap-x-2">
      <p className="text-pink-400/100 animate-bounce text-lg">.</p>
      <p className="text-pink-400/100 animate-bounce text-lg delay-100">.</p>
      <p className="text-pink-400/100 animate-bounce text-lg delay-200">.</p>
    </div>

    <p className="text-sm text-muted-foreground">
      {description ? description : "Aivia is thinking..."}
    </p>
  </div>
);
