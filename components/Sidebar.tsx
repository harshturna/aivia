"use client";

import {
  CodeIcon,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MusicIcon,
  Settings,
  Sparkles,
  VideoIcon,
} from "lucide-react";
import { AppSidebar, type SidebarRoute } from "./AppSidebar";
import { FreeCounter } from "./FreeCounter";

const routes: SidebarRoute[] = [
  { label: "Studio", icon: Sparkles, href: "/studio" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/generative" },
  { label: "Conversation", icon: MessageSquare, href: "/conversation" },
  { label: "Image Generation", icon: ImageIcon, href: "/image" },
  { label: "Video Generation", icon: VideoIcon, href: "/video" },
  { label: "Music Generation", icon: MusicIcon, href: "/music" },
  { label: "Code Generation", icon: CodeIcon, href: "/code" },
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
