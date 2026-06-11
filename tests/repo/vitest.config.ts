import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@package/plugin-sdk": path.resolve(
        __dirname,
        "../../packages/plugin-sdk/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
  },
});
