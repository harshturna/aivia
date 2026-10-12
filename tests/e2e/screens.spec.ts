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
    "/edit",
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
    expect(errors).toEqual([]);
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
