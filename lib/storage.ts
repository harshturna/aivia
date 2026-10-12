"use client";

import { createClient } from "@/lib/supabase/client";
import { BUCKET, UPLOAD_TYPES, type UploadExt } from "@/lib/upload-check";

/**
 * Puts a file the browser made (a cut, an edited image) into storage, in the signed-in
 * person's own folder, straight from the browser with their own session (TICKET-064). Storage
 * policies allow nothing else; the server then checks the file before it becomes a piece.
 */
export async function uploadMedia(blob: Blob, ext: UploadExt): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sign in to keep your work");
  const path = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: UPLOAD_TYPES[ext], upsert: false });
  if (error) throw new Error("The file could not be kept. Try again.");
  return path;
}
