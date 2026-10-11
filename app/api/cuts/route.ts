import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { recordAsset } from "@/lib/assets";
import { getUser } from "@/lib/getUser";
import { isGuestId } from "@/lib/guest-user";
import { getSession, isSessionId } from "@/lib/sessions";

/** The cut size cap, set under Vercel's 4.5 MB request limit (TICKET-042); the site runs on Railway now and the cap stays, keeping uploads small. The dialog keeps cuts under it. */
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["video/mp4", "video/webm"]);

/**
 * Keeps a cut the browser made (TICKET-040): the file goes to fal's storage, beside every
 * other output, and becomes a video in the library, on its session when it has one. The
 * shared guest account keeps nothing (TICKET-038). No generation is spent.
 */
export async function POST(req: Request) {
  const user = await getUser("ROUTE_HANDLER");
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (isGuestId(user.id))
    return new NextResponse("Sign up to keep your work", { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob) || !TYPES.has(file.type))
    return new NextResponse("A video file is required", { status: 400 });
  if (file.size > MAX_BYTES)
    return new NextResponse(
      "The cut is too large to keep; download it instead",
      {
        status: 413,
      }
    );
  // the declared type is the client's word; the first bytes are the file's (TICKET-042)
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const mp4 =
    String.fromCharCode(head[4], head[5], head[6], head[7]) === "ftyp";
  const webm =
    head[0] === 0x1a &&
    head[1] === 0x45 &&
    head[2] === 0xdf &&
    head[3] === 0xa3;
  if (!mp4 && !webm)
    return new NextResponse("A video file is required", { status: 400 });

  const rawSession = form?.get("sessionId");
  const sessionId =
    typeof rawSession === "string" &&
    isSessionId(rawSession) &&
    (await getSession(user.id, rawSession))
      ? rawSession
      : null;
  const title = String(form?.get("title") ?? "").slice(0, 200) || "A cut";
  const seconds = Number(form?.get("seconds") ?? Number.NaN);

  let url: string;
  try {
    url = await fal.storage.upload(file);
  } catch (error) {
    console.error("[CUTS]", error);
    return new NextResponse("The cut could not be kept", { status: 502 });
  }
  const asset = await recordAsset({
    userId: user.id,
    sessionId,
    kind: "video",
    url,
    prompt: `Cut: ${title}`,
    model: "aivia/cut",
    durationSec: Number.isFinite(seconds) && seconds > 0 ? seconds : null,
  });
  return NextResponse.json({ id: asset.id });
}
