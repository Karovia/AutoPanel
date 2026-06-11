# 插件 SDK

`@package/plugin-sdk` 是给插件开发者用的统一入口。

## 入口

- `@package/plugin-sdk`：通用 helper、类型和 Schema
- `@package/plugin-sdk/ui`：iframe 插件前端与宿主通信
- `@package/plugin-sdk/protocol`：Manifest、资产和节点协议
- `@package/plugin-sdk/executor`：远程执行端请求/响应类型与 helper

## 示例

```ts
import {
  defineNode,
  definePlugin,
  createPluginHost,
  completeExecutorJob,
} from "@package/plugin-sdk";

const host = createPluginHost();

const plugin = definePlugin({
  manifest: {
    schemaVersion: "1.0",
    id: "acme.gallery",
    name: "Gallery",
    version: "1.0.0",
    engine: {
      host: "^1.0.0",
      sdk: "^1.0.0",
    },
    entrypoints: {
      ui: "https://example.com/plugin/index.html",
      executor: "https://example.com/plugin/execute",
    },
    permissions: ["jobs:create"],
  },
  nodes: [
    defineNode({
      type: "acme.gallery/search",
      title: "Search Gallery",
      inputs: [{ id: "query", type: "core/text" }],
      outputs: [{ id: "image", type: "core/image" }],
    }),
  ],
});

export async function execute() {
  return completeExecutorJob({
    outputs: {
      image: {
        id: "asset_1",
        type: "core/image",
        mimeType: "image/png",
        version: 1,
        size: 42,
        checksum: "abc",
        metadata: {},
      },
    },
  });
}
```
