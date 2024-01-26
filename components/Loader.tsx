import Logo from "./Logo";

interface LoaderProps {
  description?: string;
}

export const Loader = ({ description }: LoaderProps) => (
  <div className="h-full flex flex-col gap-y-4 items-center">
    <div className="w-10 h-10 animate-spin">
      <Logo />
    </div>

    <p className="text-sm text-muted-foreground">
      {description ? description : "Aivia is thinking..."}
    </p>
  </div>
);
