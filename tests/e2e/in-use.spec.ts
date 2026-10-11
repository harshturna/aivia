import { expect, type Page, test } from "@playwright/test";

/**
 * The states the TICKET-050 audit found problems in (TICKET-056): long content, a short
 * window, phone-width dialogs, the end of a scroll. Each screen loads fine fresh; these are
 * what it looks like in use. Nothing here spends: the paid routes are never called.
 */

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 640;

/** A guest session kept in this browser, with enough runs to scroll. */
function longSession(id: string) {
  const messages = [];
  for (let i = 0; i < 7; i++) {
    messages.push({
      id: `u${i}`,
      role: "user",
      parts: [{ type: "text", text: `Brief ${i + 1}` }],
      metadata: { mode: "auto" },
    });
    messages.push({
      id: `a${i}`,
      role: "assistant",
      parts: [{ type: "text", text: "A paragraph of notes. ".repeat(40) }],
    });
  }
  return { id, title: "A long thread", updatedAt: Date.now(), messages };
}

async function seedLocal(page: Page, sessions: unknown[]) {
  await page.addInitScript((s) => {
    localStorage.setItem("aivia:guest-sessions", JSON.stringify(s));
  }, sessions);
}

/** The guest, signed in, with nothing paid reachable from the page. */
async function asGuest(page: Page) {
  await page.route(/\/api\/(agent|generate|chat)/, (r) =>
    r.fulfill({ status: 500, body: "not in tests" })
  );
  await page.goto("/login", { waitUntil: "networkidle" });
  expect((await page.request.post("/api/auth/guest")).ok()).toBe(true);
}

test.describe("in use, as the guest", () => {
  test.beforeEach(async ({ page }) => asGuest(page));

  test("a long thread ends just above the composer", async ({ page }) => {
    const session = longSession("55555555-5555-4555-8555-555555555555");
    await seedLocal(page, [session]);
    await page.goto(`/studio?local=${session.id}`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByText("Brief 7")).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await page.waitForTimeout(300);
    const gap = await page.evaluate(() => {
      const runs = document.querySelectorAll("[data-run]");
      const last = runs[runs.length - 1].getBoundingClientRect();
      const composer = document.querySelector("form")?.getBoundingClientRect();
      return composer ? composer.top - last.bottom : Number.NaN;
    });
    expect(gap, "space between the last run and the composer").toBeLessThan(
      120
    );
  });

  test("the sidebar list never runs over its footer", async ({ page }) => {
    const sessions = Array.from({ length: 5 }, (_, i) => ({
      ...longSession(`6666666${i}-6666-4666-8666-666666666666`),
      title: `A cinematic night market teaser, take ${i + 1}`,
    }));
    await seedLocal(page, sessions);
    if (isPhone(page)) await page.setViewportSize({ width: 390, height: 667 });
    else await page.setViewportSize({ width: 1440, height: 600 });
    await page.goto("/studio", { waitUntil: "networkidle" });
    if (isPhone(page))
      await page.getByRole("button", { name: "Open the menu" }).click();
    const nav = isPhone(page)
      ? page.getByRole("dialog").getByRole("navigation", { name: "Main" })
      : page.getByRole("navigation", { name: "Main" }).first();
    await expect(nav.getByText("On this device")).toBeVisible();
    const { listBottom, footTop } = await nav.evaluate((n) => {
      const list = n.querySelector(".overflow-y-auto");
      const foot = n.querySelector(".mt-auto");
      return {
        listBottom:
          list?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY,
        footTop: foot?.getBoundingClientRect().top ?? 0,
      };
    });
    expect(listBottom, "recents end above the footer").toBeLessThanOrEqual(
      footTop
    );
  });

  test("the palette stays on screen with long results", async ({ page }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.keyboard.press("Meta+k");
    await page.getByRole("combobox").fill("forest");
    await expect(page.getByRole("option").nth(1)).toBeVisible();
    await page.waitForTimeout(600);
    const box = await page.getByRole("dialog").boundingBox();
    const width = page.viewportSize()?.width ?? 0;
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
  });

  test("the mode menu stays inside a short window", async ({ page }) => {
    test.skip(isPhone(page), "a desktop window's height");
    await page.setViewportSize({ width: 1440, height: 600 });
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Mode:/ }).click();
    const menu = await page.getByRole("menu").boundingBox();
    expect(menu?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((menu?.y ?? 0) + (menu?.height ?? 0)).toBeLessThanOrEqual(600);
  });

  test("a sound's page does not widen the screen", async ({ page }) => {
    const list = await (
      await page.request.get("/api/assets?kind=audio")
    ).json();
    const sound = (list.items ?? list)[0];
    test.skip(!sound, "no sound in the library");
    await page.goto(`/library/a/${sound.id}`, { waitUntil: "networkidle" });
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
});

test.describe("in use, signed out", () => {
  test("the landing's Studio frame keeps its run inside", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const heading = page.getByRole("heading", { name: /It plans the work/ });
    // the replay starts when the frame itself is on screen, and widens nothing until its
    // poster and clip arrive: bring the frame in, then measure after they do
    await page
      .locator(".rounded-window")
      .first()
      .evaluate((f) =>
        window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - 40)
      );
    await page
      .locator(".rounded-window img")
      .first()
      .waitFor({ state: "attached", timeout: 20_000 });
    await page.waitForTimeout(2500);
    const { frameRight, contentRight } = await heading.evaluate((h) => {
      const frame = h.parentElement?.querySelector(".rounded-window");
      if (!frame) return { frameRight: 0, contentRight: 1 };
      let right = 0;
      for (const el of frame.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0) right = Math.max(right, r.right);
      }
      return {
        frameRight: frame.getBoundingClientRect().right,
        contentRight: right,
      };
    });
    expect(contentRight).toBeLessThanOrEqual(frameRight + 1);
  });

  test("with reduced motion the headline is there to read", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    // toBeVisible counts opacity 0 as visible: read it
    const opacity = await page
      .locator("h1")
      .first()
      .evaluate((h) => Number(getComputedStyle(h).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });
});
