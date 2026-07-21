import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HeadingProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

const Heading = ({
  title,
  description,
  icon: Icon,
  iconColor,
  bgColor,
}: HeadingProps) => {
  return (
    // pt-8: the heading is the first thing under the sticky navbar on every
    // tool page, and without it the icon sits flush against the navbar's
    // bottom border.
    <div className="px-4 lg:px-8 flex items-center gap-x-3 pt-8 mb-8">
      <div className={cn("p-2 w-fit rounded-md", bgColor)}>
        <Icon className={cn("w-10 h-10", iconColor)} />
      </div>
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Heading;
