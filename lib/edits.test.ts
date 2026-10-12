import { beforeEach, describe, expect, it, vi } from "vitest";

/** An in-memory Edit table with the conditional updateMany Postgres gives. */
const rows: Array<Record<string, unknown>> = [];
const match = (row: Record<string, unknown>, where: Record<string, unknown>) =>
  Object.entries(where).every(([k, v]) => row[k] === v);
vi.mock("@/lib/prismadb", () => ({
  default: {
    edit: {
      async create({ data }: { data: Record<string, unknown> }) {
        const row = {
          id: `e${rows.length + 1}`,
          rev: 0,
          outputAssetId: null,
          updatedAt: new Date(),
          ...data,
        };
        rows.push(row);
        return row;
      },
      async findFirst({ where }: { where: Record<string, unknown> }) {
        return rows.find((r) => match(r, where)) ?? null;
      },
      async findMany({ where }: { where: Record<string, unknown> }) {
        return rows.filter((r) => match(r, where));
      },
      async count({ where }: { where: Record<string, unknown> }) {
        return rows.filter((r) => match(r, where)).length;
      },
      async updateMany({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) {
        const hit = rows.filter((r) => match(r, where));
        for (const r of hit)
          for (const [k, v] of Object.entries(data))
            r[k] = k === "rev" ? (r.rev as number) + 1 : v;
        return { count: hit.length };
      },
      async deleteMany({ where }: { where: Record<string, unknown> }) {
        const before = rows.length;
        for (let i = rows.length - 1; i >= 0; i--)
          if (match(rows[i], where)) rows.splice(i, 1);
        return { count: before - rows.length };
      },
    },
  },
}));

const {
  checkDoc,
  checkImageDoc,
  createEdit,
  deleteEdit,
  getEdit,
  MAX_DOC_BYTES,
  saveEdit,
} = await import("./edits");
const { emptyDoc } = await import("./timeline/schema");
const { emptyEdit } = await import("./image-edit/schema");

beforeEach(() => {
  rows.length = 0;
  process.env.GUEST_USER_ID = "guest";
});

describe("edits", () => {
  it("saves over the rev it read, and refuses a stale one", async () => {
    const e = await createEdit("me", { projectId: null, doc: emptyDoc() });
    const first = await saveEdit("me", e.id, 0, { title: "One" });
    expect(first !== "stale" && first?.rev).toBe(1);
    // a second tab still holding rev 0
    expect(await saveEdit("me", e.id, 0, { title: "Two" })).toBe("stale");
    expect((await getEdit("me", e.id))?.title).toBe("One");
  });

  it("is invisible to anyone but its owner", async () => {
    const e = await createEdit("me", { projectId: null, doc: emptyDoc() });
    expect(await getEdit("you", e.id)).toBeNull();
    expect(await saveEdit("you", e.id, 0, { title: "x" })).toBeNull();
    expect(await deleteEdit("you", e.id)).toBe(0);
  });

  it("writes nothing for the shared guest", async () => {
    await expect(
      createEdit("guest", { projectId: null, doc: emptyDoc() })
    ).rejects.toThrow();
    expect(await getEdit("guest", "e1")).toBeNull();
  });

  it("takes only a current cut under the size cap", () => {
    expect(checkDoc(emptyDoc()).ok).toBe(true);
    expect(checkDoc({ hello: 1 }).ok).toBe(false);
    expect(checkDoc({ ...emptyDoc(), version: 99 })).toMatchObject({
      ok: false,
    });
    const huge = {
      ...emptyDoc(),
      media: { a: { url: "x".repeat(MAX_DOC_BYTES), kind: "image" } },
    };
    expect(checkDoc(huge)).toMatchObject({
      ok: false,
      error: "The cut is too large to save",
    });
  });

  it("keeps an image edit's steps, as an image edit, and nothing else", async () => {
    const steps = emptyEdit({
      url: "https://v3.fal.media/files/a.jpg",
      assetId: "a1",
      width: 1200,
      height: 1800,
    });
    expect(checkImageDoc(steps).ok).toBe(true);
    expect(checkImageDoc(emptyDoc()).ok).toBe(false);
    expect(checkImageDoc({ ...steps, rotate: 45 }).ok).toBe(false);
    const made = await createEdit("u1", {
      projectId: "p1",
      doc: steps,
      kind: "image",
    });
    expect(made).toMatchObject({ kind: "image", title: "Untitled edit" });
  });
});
