import { Dna, UserRound, Image } from "lucide-react";

export const heroHeader = {
  header: `Transform your ideas into Reality`,
  subheader: `, your suite of AI tools`,
  image: `/landing.png`,
};

export const featureCards = {
  header: `Our Suite`,
  content: [
    {
      text: `Generative AI`,
      icon: Dna,
      bgColor: "bg-violet-500/10",
      color: "text-violet-500",
    },
    {
      text: `Characters AI`,
      icon: UserRound,
      bgColor: "bg-green-700/10",
      color: "text-green-700",
    },
    {
      text: `Transformation AI`,
      icon: Image,
      color: "text-pink-700",
      bgColor: "bg-pink-700/10",
    },
  ],
};

export const features = {
  header: `Features`,
  subheader: `What our tools offer`,
  image: `/features.png`,
  content: [
    {
      text: `Generate`,
      subtext: `images, music, videos, and more!`,
      icon: Dna,
    },
    {
      text: `Chat with`,
      subtext: `any character you can imagine!`,
      icon: UserRound,
    },
    {
      text: `Transform`,
      subtext: `images like it's magic!`,
      icon: Image,
    },
  ],
};
