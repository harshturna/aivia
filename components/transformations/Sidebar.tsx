"use client";

import { cn } from "@/lib/utils";
import {
  BadgeMinus,
  Brush,
  GalleryHorizontalEnd,
  PaintBucket,
  Pipette,
  Ratio,
  Wand2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import Logo from "../Logo";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    icon: Brush,
    href: "/transformations/restore",
    label: "Image Restore",
    pro: false,
    color: "text-cyan-700",
  },
  {
    icon: Ratio,
    href: "/transformations/fill",
    label: "Generative Fill",
    pro: true,
    color: "text-green-700",
  },
  {
    icon: BadgeMinus,
    href: "/transformations/remove",
    label: "Object Remove",
    pro: false,
    color: "text-pink-500",
  },
  {
    icon: Pipette,
    href: "/transformations/recolor",
    label: "Object Recolor",
    pro: false,
    color: "text-red-500",
  },
  {
    icon: GalleryHorizontalEnd,
    href: "/transformations/removeBackground",
    label: "Background Remove",
    pro: false,
    color: "text-purple-500",
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link
          href="/dashboard"
          className="flex items-baseline gap-2 pl-3 mb-14"
        >
          <div className="relative w-8 h-8 mr-4">
            <Logo />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            Aivia
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-[50px] border-t border-slate-200/10">
          <Link
            className="flex items-center justify-center px-6 py-2 mt-5 bg-slate-100/10 hover:bg-slate-200/10 w-max mx-auto rounded-sm"
            href="/dashboard"
          >
            Discover more tools
            <Wand2 className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
