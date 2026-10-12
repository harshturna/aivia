import { getCldImageUrl } from "next-cloudinary";
import {
  cloudinaryOptions,
  type EditInput,
  isReady,
  targetSize,
} from "@/lib/edit";
import type { AiStep } from "@/lib/image-edit/schema";
import { loadImage } from "./render";

/**
 * The editor's AI tools (TICKET-067), as they were on the Edit page: the base is copied to
 * Cloudinary once by address, one generation is spent through the server's guard, and the
 * result is a transformation of the copy. Its result becomes the next step's base.
 */
const PRESET = "aivia_transformation";
const copies = new Map<
  string,
  Promise<{ publicId: string; width: number; height: number }>
>();

function copyOf(url: string) {
  let p = copies.get(url);
  if (!p) {
    p = (async () => {
      const form = new FormData();
      form.append("file", new URL(url, window.location.origin).href);
      form.append("upload_preset", PRESET);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: form }
      );
      if (!response.ok) throw new Error("copy");
      const info = (await response.json()) as {
        public_id: string;
        width: number;
        height: number;
      };
      return {
        publicId: info.public_id,
        width: info.width,
        height: info.height,
      };
    })();
    p.catch(() => copies.delete(url));
    copies.set(url, p);
  }
  return p;
}

export type ToolResult =
  | { ok: true; step: AiStep }
  | { ok: false; limit?: "free" | "guest"; message: string };

/** Generative results can answer "still working" before they exist: try a few times. */
async function arrived(url: string) {
  for (let attempt = 0; attempt <= 6; attempt++) {
    try {
      return await loadImage(attempt ? `${url}?attempt=${attempt}` : url);
    } catch {
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
  return null;
}

export async function runTool(
  base: { url: string },
  input: EditInput
): Promise<ToolResult> {
  if (!isReady(input))
    return { ok: false, message: "Fill in what the tool needs first." };
  const copy = await copyOf(base.url).catch(() => null);
  if (!copy)
    return {
      ok: false,
      message: "Could not get the picture ready. Try again.",
    };
  const spend = await fetch("/api/edit/spend", { method: "POST" }).catch(
    () => null
  );
  if (!spend?.ok) {
    if (spend?.status === 403) return { ok: false, limit: "free", message: "" };
    if (spend?.status === 429)
      return { ok: false, limit: "guest", message: "" };
    return {
      ok: false,
      message:
        spend?.status === 401
          ? "You were signed out. Reload the page to keep going."
          : "The edit could not start. Try again.",
    };
  }
  const size = targetSize(input, copy);
  const url = getCldImageUrl({
    src: copy.publicId,
    width: size.width,
    height: size.height,
    ...cloudinaryOptions(input),
  });
  const img = await arrived(url);
  if (!img)
    return { ok: false, message: "The edit did not come back. Try again." };
  return {
    ok: true,
    step: {
      tool: input.tool,
      ...(input.object?.trim() ? { object: input.object.trim() } : {}),
      ...(input.color?.trim() ? { color: input.color.trim() } : {}),
      ...(input.tool === "fill" && input.aspect
        ? { aspect: input.aspect }
        : {}),
      url: img.src.split("?attempt=")[0],
      width: img.naturalWidth,
      height: img.naturalHeight,
    },
  };
}
