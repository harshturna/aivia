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
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
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
