// Screenshot review (CLAUDE.md rule 6): every route at 1440 and 390, signed in
// as the guest, written to .shots/. Needs a running dev server:
//   PORT=3005 npm run dev &  then  npm run shots
// Options: BASE (default http://localhost:3005), PAGES (comma list),
// WIDTHS (default 1440,1024,768,390), FULL=0 for viewport-only, GUEST=0 to stay signed out,
// STATES=0 to skip the in-use states (TICKET-056): a long thread at its end, a short window
// with the mode menu open, the palette with long results, a sound's page on a phone, the
// landing with reduced motion. Fresh screens hid every problem the TICKET-050 audit found.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3005";
const OUT = ".shots";
const PAGES = (
  process.env.PAGES ??
  "/,/login,/signup,/studio,/library,/edit,/characters,/characters/new,/settings"
).split(",");
const WIDTHS = (process.env.WIDTHS ?? "1440,1024,768,390")
  .split(",")
  .map(Number);

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

if (process.env.GUEST !== "0") {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const r = await page.request.post(`${BASE}/api/auth/guest`);
  console.log("guest sign-in", r.status());
}

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
  for (const path of PAGES) {
    const name = `${path === "/" ? "landing" : path.replace(/^\//, "").replace(/\//g, "_")}@${width}.png`;
    try {
      await page.goto(BASE + path, {
        waitUntil: "networkidle",
        timeout: 45_000,
      });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${OUT}/${name}`,
        fullPage: process.env.FULL !== "0",
      });
      console.log("ok  ", name, page.url().replace(BASE, ""));
    } catch (error) {
      console.log("fail", name, String(error).slice(0, 160));
    }
  }
}
if (process.env.STATES !== "0" && process.env.GUEST !== "0") {
  const thread = {
    id: "77777777-7777-4777-8777-777777777777",
    title: "A long thread",
    updatedAt: Date.now(),
    messages: Array.from({ length: 7 }, (_, i) => [
      {
        id: `u${i}`,
        role: "user",
        parts: [{ type: "text", text: `Brief ${i + 1}` }],
      },
      {
        id: `a${i}`,
        role: "assistant",
        parts: [{ type: "text", text: "A paragraph of notes. ".repeat(40) }],
      },
    ]).flat(),
  };
  await context.addInitScript((t) => {
    localStorage.setItem("aivia:guest-sessions", JSON.stringify([t]));
  }, thread);
  const shoot = async (name, width, height, go) => {
    try {
      await page.setViewportSize({ width, height });
      await go();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${OUT}/state-${name}@${width}x${height}.png`,
      });
      console.log("ok  ", `state-${name}`, width, height);
    } catch (error) {
      console.log("fail", `state-${name}`, String(error).slice(0, 160));
    }
  };
  const open = (path) =>
    page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45_000 });
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
  ])
    await shoot("thread-end", w, h, async () => {
      await open(`/p/${thread.id}`);
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight)
      );
    });
  await shoot("short-window-menu", 1440, 600, async () => {
    await open("/studio");
    await page.getByRole("button", { name: /^Mode:/ }).click();
  });
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
  ])
    await shoot("palette", w, h, async () => {
      await open("/studio");
      await page.keyboard.press("Meta+k");
      await page.getByRole("combobox").fill("forest");
      await page.waitForTimeout(800);
    });
  await shoot("sound-page", 390, 844, async () => {
    const list = await (
      await page.request.get(`${BASE}/api/assets?kind=audio`)
    ).json();
    const sound = (list.items ?? list)[0];
    if (sound) await open(`/library/a/${sound.id}`);
  });
  // Cut: empty, then started (the timeline at 1440, the storyboard and its sheet at 390)
  const example = (
    await (await page.request.get(`${BASE}/api/sessions?limit=8`)).json()
  )[0];
  if (example)
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      await page.evaluate(() => localStorage.removeItem("aivia:guest-edits"));
      await shoot("cut-empty", w, h, () => open(`/p/${example.id}/cut`));
      await shoot("cut", w, h, async () => {
        await page.getByRole("button", { name: "Start a cut" }).click();
        await page.getByRole("img", { name: "The cut" }).waitFor();
        await page.waitForTimeout(2500);
      });
      if (w < 1024)
        await shoot("cut-sheet", w, h, async () => {
          await page
            .locator("section", {
              has: page.getByRole("heading", { name: /^Shots/ }),
            })
            .getByRole("button")
            .first()
            .click();
        });
    }
  await shoot("landing-reduced", 390, 844, async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open("/");
  });
}
await browser.close();
