"use client";

import { LayoutDashboard, Plus, Settings } from "lucide-react";
import { AppSidebar, type SidebarRoute } from "../AppSidebar";

const routes: SidebarRoute[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/characters" },
  { label: "Create", icon: Plus, href: "/characters/new" },
  { label: "Settings", icon: Settings, href: "/characters/settings" },
];

const Sidebar = () => <AppSidebar routes={routes} discoverMore />;

export default Sidebar;
