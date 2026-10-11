// Screenshot review (CLAUDE.md rule 6): every route at 1440 and 390, signed in
// as the guest, written to .shots/. Needs a running dev server:
//   PORT=3005 npm run dev &  then  npm run shots
// Options: BASE (default http://localhost:3005), PAGES (comma list),
// WIDTHS (default 1440,390), FULL=0 for viewport-only, GUEST=0 to stay signed out.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3005";
const OUT = ".shots";
const PAGES = (
  process.env.PAGES ??
  "/,/login,/dashboard,/studio,/conversation,/image,/video,/music,/code,/documents,/characters,/transformations/restore,/generative/settings"
).split(",");
const WIDTHS = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);

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
await browser.close();
