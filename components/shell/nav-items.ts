import {
  LayoutGrid,
  type LucideIcon,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

/**
 * The sidebar's sections (design §4). Edit points at the transformations until TICKET-009
 * renames them.
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
  {
    label: "Edit",
    href: "/transformations/restore",
    icon: Wand2,
    match: "/transformations",
  },
  {
    label: "Characters",
    href: "/characters",
    icon: Users,
    match: "/characters",
  },
];
