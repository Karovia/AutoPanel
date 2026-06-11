# 插件 SDK 开发指南

本文面向要为 AutoPanel 开发新插件的开发者，介绍如何使用 `@package/plugin-sdk` 创建插件定义、编写 iframe 前端，以及对接远程执行器。

## 1. 先理解插件结构

一个插件由三部分组成：

1. `plugin.ts`
   - 插件的主定义文件
   - 使用 `definePlugin()` 和 `defineNode()` 描述插件身份、版本、权限、节点输入输出
2. `index.tsx`
   - 运行在 iframe 里的前端 UI
   - 通过 `createPluginHost()` 和宿主通信
3. 远程执行器（可选）
   - 如果插件需要调用模型、RAGFlow、ComfyUI 或你自己的服务端
   - 使用 `@package/plugin-sdk` 提供的执行协议类型来收发请求

对于官方插件，`src/plugin.ts` 是源码里的插件定义入口。

## 2. 从哪里开始

你可以直接复制这个模板：

- [packages/plugin-sdk/templates/basic-plugin/plugin.ts](/Users/apple/Documents/New%20project%203/packages/plugin-sdk/templates/basic-plugin/plugin.ts:1)
- [packages/plugin-sdk/templates/basic-plugin/index.tsx](/Users/apple/Documents/New%20project%203/packages/plugin-sdk/templates/basic-plugin/index.tsx:1)

最小开发路径是：

1. 复制模板目录
2. 修改插件 `id`、`name`、`entrypoints`
3. 定义节点 `type`、`inputs`、`outputs`
4. 编写 iframe UI
5. 如果需要远程执行，再补执行器接口

## 3. 统一入口

推荐开发者只记一个包：

```ts
import {
  createPluginHost,
  defineNode,
  definePlugin,
  completeExecutorJob,
  acceptExecutorJob,
} from "@package/plugin-sdk";
```

它内部已经把这些能力聚合好了：

- Manifest 和节点 Schema
- 资产类型与常用协议类型
- iframe 前端宿主桥
- 远程执行器请求/响应 helper

如果你只想使用子路径，也可以：

- `@package/plugin-sdk/ui`
- `@package/plugin-sdk/protocol`
- `@package/plugin-sdk/executor`

## 4. 编写 `plugin.ts`

这是插件的核心定义文件：

```ts
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
```

### 关键规则

- `id` 使用稳定的命名空间，例如 `acme.example-plugin`
- 节点 `type` 使用更细的命名，例如 `acme.example-plugin/run`
- 资产类型优先使用内置 `core/*`
- 自定义类型必须使用命名空间，例如 `acme/semantic-mask`

## 5. 编写 iframe 前端

插件前端运行在 iframe 里，不能直接访问宿主内部状态。你应该通过 `createPluginHost()` 调用宿主提供的能力。

```tsx
import { createRoot } from "react-dom/client";
import { createPluginHost } from "@package/plugin-sdk";

const host = createPluginHost();

function App() {
  async function handleRun() {
    await host.call("jobs:create", {
      nodeType: "acme.example-plugin/run",
    });
  }

  return <button onClick={handleRun}>运行</button>;
}

createRoot(document.getElementById("root")!).render(<App />);
```

### 建议做法

- 把 `plugin.manifest.name`、`plugin.nodes[0].title` 直接用于界面文案，减少重复
- UI 里只采集参数和发起宿主调用
- 业务执行尽量放到远程执行器

## 6. 编写远程执行器

如果插件需要真正执行任务，可以用统一的请求/响应类型：

```ts
import {
  PLUGIN_PROTOCOL_VERSION,
  acceptExecutorJob,
  completeExecutorJob,
  type ExecutorRequest,
} from "@package/plugin-sdk";

export async function execute(
  request: ExecutorRequest<{ prompt: string }, { seed?: number }>,
) {
  if (request.inputs.prompt.length < 3) {
    return acceptExecutorJob("queued_job_1");
  }

  return completeExecutorJob({
    outputs: {
      image: {
        id: "asset_1",
        type: "core/image",
        mimeType: "image/png",
        version: 1,
        size: 42,
        checksum: "abc",
        metadata: {
          protocolVersion: PLUGIN_PROTOCOL_VERSION,
        },
      },
    },
    logs: ["任务完成"],
  });
}
```

### 两种返回方式

1. 立即完成：
   - 使用 `completeExecutorJob(...)`
2. 异步排队：
   - 使用 `acceptExecutorJob(externalJobId)`

## 7. 宿主如何识别你的插件

当前宿主支持导入 Manifest JSON 文件。

你需要保证导出的 Manifest 至少包含：

- `schemaVersion`
- `id`
- `name`
- `version`
- `engine`
- `entrypoints.ui`
- `permissions`
- `contributes.nodes`

在当前项目里，官方插件的宿主接入方式可以参考：

- [apps/web/src/features/canvas/canvas-page.tsx](/Users/apple/Documents/New%20project%203/apps/web/src/features/canvas/canvas-page.tsx:1)

## 8. 如何调试

推荐顺序：

1. 先写 `plugin.ts`
2. 跑单元测试，确认节点定义和 Manifest 合法
3. 编写 `index.tsx`
4. 在宿主中导入 Manifest
5. 如果需要远程执行，再接执行器

你可以参考这些现成示例：

- [plugins/text-input/src/plugin.ts](/Users/apple/Documents/New%20project%203/plugins/text-input/src/plugin.ts:1)
- [plugins/brand-search/src/plugin.ts](/Users/apple/Documents/New%20project%203/plugins/brand-search/src/plugin.ts:1)
- [plugins/comfyui-workflow/src/plugin.ts](/Users/apple/Documents/New%20project%203/plugins/comfyui-workflow/src/plugin.ts:1)

## 9. 删除已导入插件

宿主现在支持删除已导入的自定义插件：

- 删除后会从当前页面状态移除
- 也会同步从浏览器 `localStorage` 清除
- 这不会影响官方插件

这部分实现可以参考：

- [apps/web/src/features/plugins/import-plugin-panel.tsx](/Users/apple/Documents/New%20project%203/apps/web/src/features/plugins/import-plugin-panel.tsx:1)
- [apps/web/src/features/plugins/use-imported-plugin-manifests.ts](/Users/apple/Documents/New%20project%203/apps/web/src/features/plugins/use-imported-plugin-manifests.ts:1)

## 10. 常见建议

- Manifest 和节点定义优先放在 `plugin.ts`
- 不要在多个文件手写重复的节点元数据
- 远程执行器返回的资产类型要和节点输出类型匹配
- 给插件选择稳定的命名空间，避免后续迁移成本
- 先做一个最小单节点插件，再扩展到多节点能力
