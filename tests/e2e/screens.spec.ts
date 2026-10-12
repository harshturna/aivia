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
        has: page.getByRole("heading", { name: /^Picture/ }),
      });
      await shots.getByRole("button").first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await axe(page)).toEqual([]);
    }
    expect(errors).toEqual([]);
  });

  test("New take on an example keeps the take in the guest's copy (generation stubbed)", async ({
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
    // an example is not the guest's: the take is kept in their own copy, opened in Cut
    await expect(page).toHaveURL(
      (u) =>
        u.pathname.endsWith("/cut") && !u.pathname.includes(forest?.id ?? ""),
      { timeout: 30_000 }
    );
    await expect(page.locator("h1").first()).toContainText("(your copy)");
    await expect(
      page.locator("[data-row=main] button[aria-label^='Second take']")
    ).toBeVisible({ timeout: 30_000 });
    expect(await axe(page)).toEqual([]);
  });

  test("zoomed out, a short still after a crossfade can be chosen, moved and trimmed at both ends", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 1024, "the timeline is the desktop's");
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string; title: string }>;
    const forest = sessions.find((s) => s.title.startsWith("A forest"));
    test.skip(!forest, "no forest example for the guest");
    await page.goto(`/p/${forest?.id}/cut`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start a cut" }).click();
    const pieces = page.locator("[data-row=main] [data-item]");
    await expect(pieces.nth(1)).toBeVisible({ timeout: 30_000 });
    // trim the last still down as far as it goes, then fit the whole cut
    const still = pieces.last();
    const box = await still.boundingBox();
    if (!box) throw new Error("no still");
    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 400, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.getByRole("button", { name: "Fit" }).click();
    // a long cut's Fit is a few dozen px a second: zoom out to there
    for (let i = 0; i < 3; i++)
      await page.getByRole("button", { name: "Zoom out" }).click();
    await page.keyboard.press("Escape");
    // every picture: a point of its own body chooses it, then both of its ends are its own
    for (let i = 0; i < (await pieces.count()); i++) {
      const piece = pieces.nth(i);
      const at = await piece.evaluate((el) => {
        const b = el.getBoundingClientRect();
        const y = b.top + b.height / 2;
        const body = el.querySelector("button");
        for (let x = b.left + 1; x < b.right - 1; x++) {
          const hit = document.elementFromPoint(x, y);
          if (hit && body?.contains(hit)) return { x, y };
        }
        return null;
      });
      expect(at, `picture ${i + 1} has a body to choose it by`).not.toBeNull();
      if (!at) continue;
      await page.mouse.click(at.x, at.y);
      const ends = await piece.evaluate((el) => {
        const b = el.getBoundingClientRect();
        const y = b.top + b.height / 2;
        const own = (x: number) => {
          const hit = document.elementFromPoint(x, y);
          return !!hit && el.contains(hit) && hit.tagName === "SPAN";
        };
        return { start: own(b.left + 2), end: own(b.right - 2) };
      });
      expect(ends, `picture ${i + 1}'s ends once chosen`).toEqual({
        start: true,
        end: true,
      });
    }
    // dragging the short still's body moves it; it does not stretch
    const before = await still.getAttribute("data-item");
    const label = await still.locator("button").getAttribute("aria-label");
    const sb = await still.boundingBox();
    const body = await still.evaluate((el) => {
      const b = el.getBoundingClientRect();
      const btn = el.querySelector("button");
      for (let x = b.left + 1; x < b.right - 1; x++) {
        const hit = document.elementFromPoint(x, b.top + b.height / 2);
        if (hit && btn?.contains(hit)) return x;
      }
      return null;
    });
    if (!sb || body === null) throw new Error("no body on the short still");
    await page.mouse.move(body, sb.y + sb.height / 2);
    await page.mouse.down();
    await page.mouse.move(body - 6, sb.y + sb.height / 2, { steps: 3 });
    await page.mouse.up();
    const seconds = (t: string) =>
      t.split(":").reduce((sum, part) => sum * 60 + Number(part), 0);
    const span = (l: string | null) => {
      const [, a, b] = l?.match(/, (\S+) to (\S+)$/) ?? [];
      return seconds(b) - seconds(a);
    };
    const moved = await page
      .locator(`[data-item="${before}"] button`)
      .getAttribute("aria-label");
    expect(span(moved)).toBeCloseTo(span(label), 1);
  });

  test("deleting the title card closes the black, and the playhead stays in the cut", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 1024, "the timeline is the desktop's");
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string; title: string }>;
    const forest = sessions.find((s) => s.title.startsWith("A forest"));
    test.skip(!forest, "no forest example for the guest");
    await page.goto(`/p/${forest?.id}/cut`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start a cut" }).click();
    const card = page.locator("[data-row=text] [data-item] button").first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();
    await page.keyboard.press("Delete");
    const first = page.locator("[data-row=main] [data-item] button").first();
    await expect(first).toHaveAttribute("aria-label", / 0:00 to /);
    // the last shot chosen, the playhead at the end, then the shot removed: it follows the end in
    const last = page.locator("[data-row=main] [data-item]").last();
    await last.locator("button").click();
    const end = await last.boundingBox();
    const ruler = await page
      .locator(".sticky.top-0.z-20 > .cursor-ew-resize")
      .boundingBox();
    if (!end || !ruler) throw new Error("no ruler");
    await page.mouse.click(end.x + end.width - 1, ruler.y + 10);
    await page.keyboard.press("Delete");
    const readout = page.getByText(/^\d+:\d\d\.\d \/ \d+:\d\d\.\d$/);
    await expect(readout).toBeVisible();
    const [now, length] = ((await readout.textContent()) ?? "")
      .split(" / ")
      .map((t) =>
        t.split(":").reduce((sum, part) => sum * 60 + Number(part), 0)
      );
    expect(now).toBeLessThanOrEqual(length);
  });

  test("on the storyboard, a tight trim lets go and Removed's Undo only undoes the removal", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) >= 1024, "the storyboard is the phone's");
    const sessions = (await (
      await page.request.get("/api/sessions")
    ).json()) as Array<{ id: string; title: string }>;
    const forest = sessions.find((s) => s.title.startsWith("A forest"));
    test.skip(!forest, "no forest example for the guest");
    await page.goto(`/p/${forest?.id}/cut`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start a cut" }).click();
    const shots = page.locator("section", {
      has: page.getByRole("heading", { name: /^Picture/ }),
    });
    await expect(shots.locator("li")).toHaveCount(2, { timeout: 30_000 });
    // swipe the second shot away, then another edit: the bar goes with it
    const tree = await shots.locator("li").nth(1).boundingBox();
    if (!tree) throw new Error("no shot");
    await page.mouse.move(tree.x + tree.width - 30, tree.y + tree.height / 2);
    await page.mouse.down();
    await page.mouse.move(tree.x + tree.width - 200, tree.y + tree.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
    // by its markup: while a sheet is open the rest of the page is hidden from roles
    const bar = page.locator("[role=status]").filter({ hasText: "Removed" });
    await expect(bar).toBeVisible();
    await page.getByRole("button", { name: /^Add a text card/ }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // at once, not when the bar times out after 5 s
    await expect(bar).toHaveCount(0, { timeout: 1000 });
    // the clip's start pushed to its end, then pulled back: the start handle still takes it
    await shots.locator("li").first().getByRole("button").last().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // the sheet has finished rising before a handle is measured
    await page
      .getByRole("dialog")
      .evaluate((el) =>
        Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished))
      );
    const start = page.getByRole("slider", { name: "Start of the clip" });
    const track = await start.locator("..").boundingBox();
    let handle = await start.boundingBox();
    if (!track || !handle) throw new Error("no trim bar");
    const y = handle.y + handle.height / 2;
    await page.mouse.move(handle.x + handle.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(track.x + track.width, y, { steps: 10 });
    await page.mouse.up();
    handle = await start.boundingBox();
    if (!handle) throw new Error("no handle");
    await page.mouse.move(handle.x + handle.width / 2 - 4, y);
    await page.mouse.down();
    await page.mouse.move(track.x + track.width * 0.3, y, { steps: 10 });
    await page.mouse.up();
    expect(Number(await start.getAttribute("aria-valuenow"))).toBeLessThan(
      3000
    );
    expect(await axe(page)).toEqual([]);
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
