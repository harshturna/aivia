/**
 * The composer's modes (design §5.2). A plain module, not "use client", so server pages can
 * read it: importing a value from a client module gives a server component a reference.
 */
export type ComposerMode = "auto" | "image" | "video" | "music" | "sound";

export const MODES: Array<{
  id: ComposerMode;
  label: string;
  hint: string;
  placeholder: string;
}> = [
  {
    id: "auto",
    label: "Auto",
    hint: "Aivia plans the work and picks the tools",
    placeholder: "Describe what you want made…",
  },
  {
    id: "image",
    label: "Image",
    hint: "One prompt, one to four images",
    placeholder: "Describe the image…",
  },
  {
    id: "video",
    label: "Video",
    hint: "A five-second clip, or a still brought to life",
    placeholder:
      "Describe the scene and the motion, or attach a still to animate…",
  },
  {
    id: "music",
    label: "Music",
    hint: "A track with melody and rhythm",
    placeholder: "Describe the music…",
  },
  {
    id: "sound",
    label: "Sound",
    hint: "A sound effect, no melody",
    placeholder: "Describe the sound…",
  },
];
