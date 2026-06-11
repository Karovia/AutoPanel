import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@package/plugin-sdk": path.resolve(
        __dirname,
        "../../packages/plugin-sdk/src/index.ts",
      ),
      "@package/plugin-runtime": path.resolve(
        __dirname,
        "../../packages/plugin-runtime/src/index.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
