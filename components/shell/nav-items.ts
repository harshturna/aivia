import { House, LayoutGrid, type LucideIcon, Users, Wand2 } from "lucide-react";

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
  // Home: the composer and every project (D-005, TICKET-062)
  { label: "Home", href: "/studio", icon: House, match: "/studio" },
  { label: "Library", href: "/library", icon: LayoutGrid, match: "/library" },
  // until the image editor arrives in the project (TICKET-067)
  { label: "Edit", href: "/edit", icon: Wand2, match: "/edit" },
  {
    label: "Characters",
    href: "/characters",
    icon: Users,
    match: "/characters",
  },
];
