import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSessionId } from "@/lib/session-text";
import { GUEST_EXAMPLES } from "./guest-examples";

const file = (url: string) => path.join(process.cwd(), "public", url);

/** Every output a run shows, read the way components/studio/outputs.tsx reads it. */
function outputUrls(example: (typeof GUEST_EXAMPLES)[number]) {
  return example.messages.flatMap((m) =>
    m.parts.flatMap((p) => {
      const part = p as {
        type: string;
        output?: { url?: string; urls?: string[] };
      };
      if (!part.type.startsWith("tool-") || !part.output) return [];
      return part.output.urls ?? (part.output.url ? [part.output.url] : []);
    })
  );
}

describe("guest examples", () => {
  it("has a few, each with a session id, a title, a brief and a reply", () => {
    expect(GUEST_EXAMPLES.length).toBeGreaterThanOrEqual(3);
    for (const e of GUEST_EXAMPLES) {
      expect(isSessionId(e.id)).toBe(true);
      expect(e.title.length).toBeGreaterThan(0);
      expect(e.messages.map((m) => m.role)).toEqual(["user", "assistant"]);
    }
    expect(new Set(GUEST_EXAMPLES.map((e) => e.id)).size).toBe(
      GUEST_EXAMPLES.length
    );
  });

  it("names only files that exist in public/", () => {
    for (const e of GUEST_EXAMPLES) {
      for (const a of e.assets) {
        expect(existsSync(file(a.url)), a.url).toBe(true);
        if (a.posterUrl)
          expect(existsSync(file(a.posterUrl)), a.posterUrl).toBe(true);
      }
      for (const url of outputUrls(e))
        expect(existsSync(file(url)), url).toBe(true);
    }
  });

  it("keeps a library asset for every output the run shows", () => {
    for (const e of GUEST_EXAMPLES)
      expect(new Set(e.assets.map((a) => a.url))).toEqual(
        new Set(outputUrls(e))
      );
  });
});
