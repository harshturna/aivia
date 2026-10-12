import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/** Serious and critical axe violations, with where they are, for a readable failure. */
async function axe(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("nextjs-portal")
    .analyze();
  return result.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${v.id}: ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(" "))
          .join(" | ")}`
    );
}

async function fits(page: Page) {
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewport = page.viewportSize()?.width ?? 0;
  expect(width, "no horizontal scroll").toBeLessThanOrEqual(viewport);
}

test.describe("signed out", () => {
  for (const path of ["/", "/login", "/signup"]) {
    test(`${path} loads, fits, passes axe`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      // axe reads opacity, so the landing is judged in its settled state: with reduced motion
      // every fade and replay renders final (TICKET-040: the demo's steps kept racing a wait)
      if (path === "/") await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1").first()).toBeVisible();
      if (path === "/") {
        // scroll every section in so lazy media and the replay are in their final state
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
        });
        // axe reads opacity, so judge the page between fades, not halfway through one
        // (TICKET-036: the demo's steps were caught mid-fade); looping ambience is ignored
        await page.waitForFunction(
          () =>
            document
              .getAnimations()
              .every(
                (a) =>
                  a.playState !== "running" ||
                  a.effect?.getTiming().iterations === Number.POSITIVE_INFINITY
              ),
          null,
          { timeout: 15_000 }
        );
      }
      await fits(page);
      expect(await axe(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("as the guest", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    const r = await page.request.post("/api/auth/guest");
    expect(r.ok()).toBe(true);
  });

  for (const path of [
    "/studio",
    "/library",
    "/characters",
    "/characters/new",
    "/settings",
  ]) {
    test(`${path} loads, fits, passes axe`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1").first()).toBeVisible();
      await fits(page);
      expect(await axe(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test("a saved session loads, fits, passes axe", async ({ page }) => {
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string }>;
    test.skip(sessions.length === 0, "no saved session for the guest");
    await page.goto(`/p/${sessions[0].id}`, { waitUntil: "networkidle" });
    await fits(page);
    expect(await axe(page)).toEqual([]);
  });

  test("the Cut view starts a cut, fits, passes axe", async ({ page }) => {
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string }>;
    test.skip(sessions.length === 0, "no saved session for the guest");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/p/${sessions[0].id}/cut`, { waitUntil: "networkidle" });
    await expect(page.getByText("No cut yet")).toBeVisible();
    await fits(page);
    expect(await axe(page)).toEqual([]);
    await page.getByRole("button", { name: "Start a cut" }).click();
    await expect(page.getByRole("img", { name: "The cut" })).toBeVisible({
      timeout: 30_000,
    });
    await fits(page);
    expect(await axe(page)).toEqual([]);
    // a phone edits on the storyboard: a shot opens its sheet
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      const shots = page.locator("section", {
        has: page.getByRole("heading", { name: /^Shots/ }),
      });
      await shots.getByRole("button").first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await axe(page)).toEqual([]);
    }
    expect(errors).toEqual([]);
  });

  test("New take swaps a clip in the cut (generation stubbed)", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 1024, "the timeline is the desktop's");
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string; title: string }>;
    const forest = sessions.find((s) => s.title.startsWith("A forest"));
    test.skip(!forest, "no forest example for the guest");
    // no money: the direct route answers with the same clip under a new name
    await page.route("**/api/generate", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}");
      const old = body.messages?.at(-1)?.parts?.[0]?.text ?? "";
      expect(old).not.toBe("");
      const clip = (await (
        await page.request.get(`/api/assets?project=${forest?.id}&kind=video`)
      ).json()) as { items: Array<{ url: string }> };
      const chunks = [
        { type: "start" },
        { type: "start-step" },
        {
          type: "tool-input-available",
          toolCallId: "t",
          toolName: "generate_video",
          input: { prompt: "x" },
        },
        {
          type: "tool-output-available",
          toolCallId: "t",
          output: { url: `${clip.items[0].url}#take`, prompt: "A second take" },
        },
        { type: "finish-step" },
        { type: "finish" },
      ];
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body: `${chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("")}data: [DONE]\n\n`,
      });
    });
    await page.goto(`/p/${forest?.id}/cut`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start a cut" }).click();
    const clip = page
      .locator("[data-row=main] button[aria-label*=' to ']")
      .first();
    await expect(clip).toBeVisible({ timeout: 30_000 });
    await clip.click();
    await page.getByRole("button", { name: "New take" }).click();
    await expect(
      page.locator("[data-row=main] button[aria-label^='A second take']")
    ).toBeVisible({ timeout: 30_000 });
    expect(await axe(page)).toEqual([]);
    await page.getByRole("button", { name: /^Undo/ }).click();
    await expect(
      page.locator("[data-row=main] button[aria-label^='A second take']")
    ).toHaveCount(0);
  });

  test("the image editor opens on a picture, fits, passes axe", async ({
    page,
  }) => {
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string }>;
    test.skip(sessions.length === 0, "no saved session for the guest");
    const images = (await (
      await page.request.get(`/api/assets?project=${sessions[0].id}&kind=image`)
    ).json()) as { items: Array<{ id: string }> };
    test.skip(images.items.length === 0, "no picture in the example");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/p/${sessions[0].id}/edit?src=${images.items[0].id}`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByRole("img", { name: /^The picture/ })).toBeVisible();
    await fits(page);
    expect(await axe(page)).toEqual([]);
    // words on the picture, and the text tools, pass too
    await page.getByRole("tab", { name: "Text" }).click();
    await page.getByRole("button", { name: "Add words" }).click();
    await expect(
      page.getByRole("textbox", { name: "The words" })
    ).toBeVisible();
    expect(await axe(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("an old Edit address opens the picture in its project", async ({
    page,
  }) => {
    await page.goto("/edit", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/studio$/);
  });

  test("the lightbox traps focus and closes on Escape", async ({ page }) => {
    await page.goto("/library", { waitUntil: "networkidle" });
    const tile = page.locator("figure a").first();
    test.skip((await tile.count()) === 0, "nothing in the library");
    await tile.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await axe(page)).toEqual([]);
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((d) => d.contains(document.activeElement))
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the command palette opens on ⌘K and passes axe", async ({ page }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("combobox")).toBeVisible();
    expect(await axe(page)).toEqual([]);
  });
});
