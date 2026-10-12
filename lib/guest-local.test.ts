// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  claimLocalSessions,
  listLocalSessions,
  saveLocalSession,
} from "./guest-local";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

const msg = (id: string) => ({
  id,
  role: "user",
  parts: [{ type: "text", text: "A brief" }],
});

describe("claiming this browser's work", () => {
  it("lets go of only what the account kept", async () => {
    for (const id of [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ])
      saveLocalSession({
        id,
        title: id.slice(0, 4),
        messages: [msg(`m${id[0]}`)] as never,
      });
    expect(listLocalSessions()).toHaveLength(2);
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify({
            ids: ["c1"],
            keptLocal: ["11111111-1111-4111-8111-111111111111"],
          }),
          { status: 200 }
        )
    );
    expect(await claimLocalSessions()).toBe("c1");
    // the account was full: the second stays here, not lost
    expect(listLocalSessions().map((s) => s.id)).toEqual([
      "22222222-2222-4222-8222-222222222222",
    ]);
  });
});
