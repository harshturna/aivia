import {
  Code,
  Image,
  MessageSquare,
  Music,
  Video,
  Dna,
  UserRound,
  BookText,
} from "lucide-react";

export const MAX_FREE_COUNTS = 5;
export const HARD_LIMIT_COUNTS = 50;

export type ContextType =
  | "ROUTE_HANDLER"
  | "SERVER_COMPONENT"
  | "CLIENT_COMPONENT";

export const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/conversation",
  },
  {
    label: "Music Generation",
    icon: Music,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/music",
  },
  {
    label: "Image Generation",
    icon: Image,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/image",
  },
  {
    label: "Video Generation",
    icon: Video,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/video",
  },
  {
    label: "Code",
    icon: Code,
    color: "text-emerald-500",
    bgColor: "bg-emerald-700/10",
    href: "/code",
  },
];

export const offerings = [
  {
    label: "Generative AI",
    description: "Generate text, code, images, videos and music",
    icon: Dna,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/generative",
  },
  {
    label: "Companion AI",
    description: "Chat with notable people or create your own companion",
    icon: UserRound,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/characters",
  },
  {
    label: "Documents AI",
    description: "Chat with your PDFs, youtube videos, and more",
    icon: BookText,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/documents",
  },
];

export const aspectRatioOptions = {
  "1:1": {
    aspectRatio: "1:1",
    label: "Square (1:1)",
    width: 1000,
    height: 1000,
  },
  "3:4": {
    aspectRatio: "3:4",
    label: "Standard Portrait (3:4)",
    width: 1000,
    height: 1334,
  },
  "9:16": {
    aspectRatio: "9:16",
    label: "Phone Portrait (9:16)",
    width: 1000,
    height: 1778,
  },
};

export const defaultValues = {
  title: "",
  aspectRatio: "",
  color: "",
  prompt: "",
  publicId: "",
};

export const transformationTypes = {
  restore: {
    type: "restore",
    title: "Restore Image",
    subTitle: "Refine images by removing noise and imperfections",
    config: { restore: true },
    icon: "image.svg",
  },
  removeBackground: {
    type: "removeBackground",
    title: "Background Remove",
    subTitle: "Removes the background of the image using AI",
    config: { removeBackground: true },
    icon: "camera.svg",
  },
  fill: {
    type: "fill",
    title: "Generative Fill",
    subTitle: "Enhance an image's dimensions using AI outpainting",
    config: { fillBackground: true },
    icon: "stars.svg",
  },
  remove: {
    type: "remove",
    title: "Object Remove",
    subTitle: "Identify and eliminate objects from images",
    config: {
      remove: { prompt: "", removeShadow: true, multiple: true },
    },
    icon: "scan.svg",
  },
  recolor: {
    type: "recolor",
    title: "Object Recolor",
    subTitle: "Identify and recolor objects from the image",
    config: {
      recolor: { prompt: "", to: "", multiple: true },
    },
    icon: "filter.svg",
  },
};
