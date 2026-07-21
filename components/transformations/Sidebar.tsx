"use client";

import {
  BadgeMinus,
  Brush,
  GalleryHorizontalEnd,
  Pipette,
  Ratio,
} from "lucide-react";
import { AppSidebar, type SidebarRoute } from "../AppSidebar";

const routes: SidebarRoute[] = [
  { label: "Image Restore", icon: Brush, href: "/transformations/restore" },
  { label: "Generative Fill", icon: Ratio, href: "/transformations/fill" },
  { label: "Object Remove", icon: BadgeMinus, href: "/transformations/remove" },
  { label: "Object Recolor", icon: Pipette, href: "/transformations/recolor" },
  {
    label: "Background Remove",
    icon: GalleryHorizontalEnd,
    href: "/transformations/removeBackground",
  },
];

const Sidebar = () => <AppSidebar routes={routes} discoverMore />;

export default Sidebar;
