import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h2 className="font-display text-2xl font-semibold">Page not found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Back to the dashboard
      </Link>
    </div>
  );
}
