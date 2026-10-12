import { z } from "zod";
import { isEditableUrl } from "./sources";

/**
 * An image edit (D-005 §17.7, TICKET-067): the steps on a source, never the pixels. Kept whole,
 * so a saved version reopens editable. AI steps run first, each on the last one's result; then
 * the picture is turned, cropped, coloured and given its words. Positions and sizes are
 * fractions of the picture, so they survive a change of base or of size.
 */
export const IMAGE_EDIT_VERSION = 1;

export const CROP_SHAPES = [
  "free",
  "1:1",
  "3:4",
  "4:3",
  "16:9",
  "9:16",
] as const;
export type CropShape = (typeof CROP_SHAPES)[number];

const unit = z.number().min(0).max(1);
// only addresses the editor would open: never javascript:, never a host someone else chose
const url = z
  .string()
  .max(2000)
  .refine(
    (u) =>
      isEditableUrl(
        u,
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_APP_URL
      ),
    "Not an address the editor opens"
  );
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

export const aiStepSchema = z.object({
  tool: z.enum(["restore", "removeBackground", "recolor", "remove", "fill"]),
  object: z.string().max(200).optional(),
  color: z.string().max(80).optional(),
  aspect: z.enum(["1:1", "3:4", "4:3", "16:9", "9:16"]).optional(),
  url,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const textBoxSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().max(300),
  face: z.enum(["display", "body"]),
  color: hex,
  /** The type's size as a fraction of the picture's height. */
  size: z.number().min(0.02).max(0.3),
  /** The middle of the words. */
  x: unit,
  y: unit,
});

export const imageEditSchema = z.object({
  schema: z.literal("aivia.image"),
  version: z.literal(IMAGE_EDIT_VERSION),
  source: z.object({
    url,
    assetId: z.string().max(64).optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  ai: z.array(aiStepSchema).max(12),
  rotate: z.union([
    z.literal(0),
    z.literal(90),
    z.literal(180),
    z.literal(270),
  ]),
  flip: z.boolean(),
  /** Of the turned picture; null keeps all of it. */
  crop: z
    .object({
      shape: z.enum(CROP_SHAPES),
      x: unit,
      y: unit,
      width: unit,
      height: unit,
    })
    .nullable(),
  adjust: z.object({
    brightness: z.number().min(-100).max(100),
    contrast: z.number().min(-100).max(100),
    saturation: z.number().min(-100).max(100),
    warmth: z.number().min(-100).max(100),
  }),
  texts: z.array(textBoxSchema).max(12),
});

export type ImageEdit = z.infer<typeof imageEditSchema>;
export type AiStep = z.infer<typeof aiStepSchema>;
export type TextBox = z.infer<typeof textBoxSchema>;
export type Adjust = ImageEdit["adjust"];
export type Crop = NonNullable<ImageEdit["crop"]>;

export const NO_ADJUST: Adjust = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
};

export function emptyEdit(source: ImageEdit["source"]): ImageEdit {
  return {
    schema: "aivia.image",
    version: IMAGE_EDIT_VERSION,
    source,
    ai: [],
    rotate: 0,
    flip: false,
    crop: null,
    adjust: { ...NO_ADJUST },
    texts: [],
  };
}

/** The picture the turn, crop, colour and words apply to: the last AI result, or the source. */
export function baseOf(doc: ImageEdit) {
  const last = doc.ai[doc.ai.length - 1];
  return last
    ? { url: last.url, width: last.width, height: last.height }
    : doc.source;
}

/** Whether the doc changes anything at all. */
export function isChanged(doc: ImageEdit) {
  return (
    doc.ai.length > 0 ||
    doc.rotate !== 0 ||
    doc.flip ||
    doc.crop !== null ||
    Object.values(doc.adjust).some((v) => v !== 0) ||
    doc.texts.some((t) => t.text.trim())
  );
}
