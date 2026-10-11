import { defineConfig } from "@playwright/test";

/**
 * The smoke suite (TICKET-014): every screen loads, passes axe, and fits at 1440 and 390.
 * It needs the app running with `.env` (`PORT=3005 npm run dev`), so it is not part of
 * `npm run verify`; run it with `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: process.env.BASE ?? "http://localhost:3005" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "phone",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
