import { defineNode, definePlugin } from "@package/plugin-sdk";

export const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "core.image-viewer",
    name: "图片预览",
    version: "0.1.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "http://localhost:4105/index.html",
    },
    permissions: [],
  },
  nodes: [
    defineNode({
      type: "core.image-viewer/node",
      title: "图片预览",
      inputs: [{ id: "image", type: "core/image" }],
      outputs: [],
    }),
  ] as const,
});

export const manifest = plugin.manifest;
