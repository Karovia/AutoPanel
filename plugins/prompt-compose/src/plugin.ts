import { defineNode, definePlugin } from "@package/plugin-sdk";

export const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "core.prompt-compose",
    name: "提示词拼装",
    version: "0.1.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "http://localhost:4103/index.html",
    },
    permissions: [],
  },
  nodes: [
    defineNode({
      type: "core.prompt-compose/node",
      title: "提示词拼装",
      inputs: [
        { id: "text", type: "core/text" },
        { id: "context", type: "core/text" },
      ],
      outputs: [{ id: "prompt", type: "core/text" }],
    }),
  ] as const,
});

export const manifest = plugin.manifest;
