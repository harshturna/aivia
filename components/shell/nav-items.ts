import {
  LayoutGrid,
  type LucideIcon,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

/**
 * The sidebar's sections (design §4).
 */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Studio", href: "/studio", icon: Sparkles, match: "/studio" },
  { label: "Library", href: "/library", icon: LayoutGrid, match: "/library" },
  { label: "Edit", href: "/edit", icon: Wand2, match: "/edit" },
  {
    label: "Characters",
    href: "/characters",
    icon: Users,
    match: "/characters",
  },
];
