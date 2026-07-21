import {
  Sparkles,
  ImageIcon,
  UserRound,
  Wand2,
  Code,
  Clapperboard,
} from "lucide-react";

export const heroHeader = {
  header: `Transform your ideas into reality`,
  subheader: ` plans it and builds it — images, video, music and code.`,
  image: `/landing.png`,
};

export const features = {
  header: `Features`,
  subheader: `What our tools offer`,
  content: [
    {
      text: `Agentic Studio`,
      subtext: `One prompt. Aivia plans the work, picks the tools, and runs them — grounded with live web search.`,
      icon: Sparkles,
    },
    {
      text: `Generate anything`,
      subtext: `Images, video and music from state-of-the-art models, streamed as they are made.`,
      icon: ImageIcon,
    },
    {
      text: `Write code`,
      subtext: `Streaming code generation with visible reasoning and syntax-highlighted output.`,
      icon: Code,
    },
    {
      text: `Chat with characters`,
      subtext: `Talk to notable personalities, or design your own with a backstory and voice.`,
      icon: UserRound,
    },
    {
      text: `Transform images`,
      subtext: `Restore, recolor, remove objects and swap backgrounds like it's magic.`,
      icon: Wand2,
    },
    {
      text: `Watch it work`,
      subtext: `Responses stream in real time — plans, reasoning, sources and artifacts as they happen.`,
      icon: Clapperboard,
    },
  ],
};
