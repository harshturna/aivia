import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests need no services and run inside `npm run verify`.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    // Component tests are *.test.tsx and opt into jsdom with a
    // `// @vitest-environment jsdom` docblock; everything else stays in node.
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/node_modules/**", ".claude/**", ".next/**"],
  },
});
