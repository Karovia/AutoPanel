import { defineNode, definePlugin } from "@package/plugin-sdk";

export const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "core.brand-search",
    name: "品牌检索",
    version: "0.1.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "http://localhost:4102/index.html",
    },
    permissions: ["jobs:create"],
  },
  nodes: [
    defineNode({
      type: "core.brand-search/node",
      title: "品牌检索",
      inputs: [{ id: "query", type: "core/text" }],
      outputs: [{ id: "results", type: "core/text" }],
    }),
  ] as const,
});

export const manifest = plugin.manifest;
