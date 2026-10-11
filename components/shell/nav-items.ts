import { type LucideIcon, Sparkles, Users, Wand2 } from "lucide-react";

/**
 * The sidebar's sections (design §4). Library joins when TICKET-008 lands; Edit points at
 * the transformations until TICKET-009 renames them.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Studio", href: "/studio", icon: Sparkles, match: "/studio" },
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
