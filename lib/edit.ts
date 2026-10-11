/**
 * Edit's tools (design §7): what each one asks for and the Cloudinary options it becomes.
 * Pure, so the mapping is tested and both the server page and the client can read it.
 */
export type EditTool =
  | "restore"
  | "removeBackground"
  | "recolor"
  | "remove"
  | "fill";

export const EDIT_TOOLS: Array<{
  id: EditTool;
  label: string;
  action: string;
  hint: string;
}> = [
  {
    id: "restore",
    label: "Restore",
    action: "Restore",
    hint: "Clears noise, blur and compression marks",
  },
  {
    id: "removeBackground",
    label: "Remove background",
    action: "Remove the background",
    hint: "Keeps the subject, drops the rest",
  },
  {
    id: "recolor",
    label: "Recolor",
    action: "Recolor",
    hint: "Changes the colour of one thing in the picture",
  },
  {
    id: "remove",
    label: "Remove object",
    action: "Remove it",
    hint: "Takes one thing out and fills the gap",
  },
  {
    id: "fill",
    label: "Fill",
    action: "Extend the image",
    hint: "Grows the picture to a new shape",
  },
];

export const FILL_ASPECTS = ["1:1", "3:4", "4:3", "16:9", "9:16"] as const;
export type FillAspect = (typeof FILL_ASPECTS)[number];

export function isEditTool(value: unknown): value is EditTool {
  return EDIT_TOOLS.some((t) => t.id === value);
}

export interface EditInput {
  tool: EditTool;
  /** What to recolor or remove. */
  object?: string;
  /** The colour to recolor to. */
  color?: string;
  aspect?: FillAspect;
}

/** Whether the tool has what it needs to run. */
export function isReady(input: EditInput) {
  if (input.tool === "recolor")
    return Boolean(input.object?.trim() && input.color?.trim());
  if (input.tool === "remove") return Boolean(input.object?.trim());
  if (input.tool === "fill") return Boolean(input.aspect);
  return true;
}

/** The size the result is requested at: the source's, or the fill target's around it. */
export function targetSize(
  input: EditInput,
  source: { width: number; height: number }
): { width: number; height: number } {
  if (input.tool !== "fill" || !input.aspect) return source;
  const [w, h] = input.aspect.split(":").map(Number);
  // Grow, never shrink: the new shape contains the original.
  const scale = Math.max(source.width / w, source.height / h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** The options `getCldImageUrl` takes for the tool, beside the source and the size. */
export function cloudinaryOptions(input: EditInput): Record<string, unknown> {
  switch (input.tool) {
    case "restore":
      return { restore: true };
    case "removeBackground":
      return { removeBackground: true };
    case "recolor":
      return {
        recolor: {
          prompt: input.object?.trim(),
          to: input.color?.trim(),
          multiple: true,
        },
      };
    case "remove":
      return {
        remove: {
          prompt: input.object?.trim(),
          removeShadow: true,
          multiple: true,
        },
      };
    case "fill":
      return { fillBackground: true, crop: "pad" };
  }
}
