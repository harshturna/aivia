"use client";

import {
  BookText,
  CodeIcon,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MusicIcon,
  Settings,
  Sparkles,
  UserRound,
  VideoIcon,
  Wand2,
} from "lucide-react";
import { AppSidebar, type SidebarRoute } from "./AppSidebar";
import { FreeCounter } from "./FreeCounter";

/**
 * Grouped in three: the section home, the generative tools, then the app's
 * other two sections.
 *
 * Companion and Transformations live in their own route groups with their own
 * sidebars, so from inside Generative AI they were previously reachable only
 * by clicking the wordmark — nothing indicated that was a link, which made two
 * of the five advertised sections effectively invisible.
 */
const routes: SidebarRoute[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/generative",
    separatorAfter: true,
  },
  { label: "Studio", icon: Sparkles, href: "/studio" },
  { label: "Conversation", icon: MessageSquare, href: "/conversation" },
  { label: "Image Generation", icon: ImageIcon, href: "/image" },
  { label: "Video Generation", icon: VideoIcon, href: "/video" },
  { label: "Music Generation", icon: MusicIcon, href: "/music" },
  { label: "Code Generation", icon: CodeIcon, href: "/code" },
  { label: "Documents", icon: BookText, href: "/documents", separatorAfter: true },
  { label: "Companion AI", icon: UserRound, href: "/characters" },
  {
    label: "Transformations",
    icon: Wand2,
    href: "/transformations/restore",
    separatorAfter: true,
  },
  { label: "Settings", icon: Settings, href: "/generative/settings" },
];

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

const Sidebar = ({ apiLimitCount = 0, isPro = false }: SidebarProps) => (
  <AppSidebar routes={routes}>
    <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
  </AppSidebar>
);

export default Sidebar;
