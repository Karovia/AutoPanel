import { defineNode, definePlugin } from "@package/plugin-sdk";

export const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "core.comfyui-workflow",
    name: "ComfyUI 工作流",
    version: "0.1.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "http://localhost:4104/index.html",
    },
    permissions: ["jobs:create"],
  },
  nodes: [
    defineNode({
      type: "core.comfyui-workflow/node",
      title: "ComfyUI 工作流",
      inputs: [{ id: "prompt", type: "core/text" }],
      outputs: [{ id: "image", type: "core/image" }],
    }),
  ] as const,
});

export const manifest = plugin.manifest;
