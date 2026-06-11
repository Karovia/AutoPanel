import { defineNode, definePlugin } from "@package/plugin-sdk";

export const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "acme.example-plugin",
    name: "示例插件",
    version: "0.1.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "https://example.com/plugins/example-plugin/index.html",
      executor: "https://example.com/plugins/example-plugin/execute",
    },
    permissions: ["jobs:create"],
  },
  nodes: [
    defineNode({
      type: "acme.example-plugin/run",
      title: "示例执行节点",
      inputs: [{ id: "prompt", type: "core/text" }],
      outputs: [{ id: "image", type: "core/image" }],
    }),
  ] as const,
});

export const manifest = plugin.manifest;
