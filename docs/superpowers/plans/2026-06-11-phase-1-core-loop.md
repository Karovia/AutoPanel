# 第一阶段核心闭环实施计划

> **面向代理执行者：** 必须使用子技能 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐项实现本计划。步骤使用复选框语法（`- [ ]`）进行追踪。

**目标：** 构建插件优先 AI 创意画布的第一块可用能力，让用户可以安装官方插件、在画布上组合一个小型工作流、执行 DAG、通过公网 HTTPS 从 RAGFlow 检索品牌上下文、通过公网 HTTPS 使用 ComfyUI 生成图片，并在重新打开已保存项目时保留输出结果。

**架构：** 第一阶段保持系统形态接近生产环境，但范围刻意收窄。我们将交付一个 TypeScript monorepo，其中包含 Next.js Web 宿主、NestJS API、BullMQ Worker、共享协议与工作流包、浏览器 iframe 插件运行时，以及一组小规模官方插件。我们会有意推迟 Docker Connector Agent、第三方市场审核流程、分享、导出包以及高级控制流能力，以确保第一个里程碑优先证明核心执行闭环。

**技术栈：** `pnpm`、`Turborepo`、`TypeScript`、`Next.js`、`React`、`React Flow`、`Zustand`、`Vitest`、`Playwright`、`NestJS`、`Prisma`、`PostgreSQL`、`Redis`、`BullMQ`、`MinIO`、`Ajv`、`Zod`

---

## 阶段边界

本计划只实现设计规格中最小但可用的生产化切片：

- 包含：
  - Monorepo 骨架
  - 共享协议、资产类型、插件 Manifest Schema、DAG 快照逻辑
  - 项目、资产、插件安装、外部连接与工作流运行相关 API
  - Web 宿主画布、节点图编辑、插件 iframe 挂载、自动保存
  - 带节点运行缓存与资产持久化的 Worker 执行链路
  - 官方插件：`text-input`、`brand-search`、`prompt-compose`、`comfyui-workflow`、`image-viewer`
  - 插件 SDK、UI SDK、本地插件开发入口
  - 面向 RAGFlow 与 ComfyUI 的公网 HTTPS 集成
  - 用于证明完整闭环的端到端测试

- 延后到后续计划：
  - Docker Connector Agent
  - 第三方插件发布与审批流程
  - 计费、分享、快照、导出包
  - 多用户认证与工作区邀请
  - 面向任意第三方插件执行器的 capability token 扩散机制
  - 通用图片上传、文件导出以及更广泛的资产预览器

## 文件结构

在开始编写功能代码之前，先将仓库整理为以下结构：

```text
apps/
  web/
  api/
  worker/

packages/
  protocol/
  asset-types/
  workflow-core/
  plugin-sdk/
  ui-sdk/
  plugin-runtime/
  design-system/

plugins/
  text-input/
  brand-search/
  prompt-compose/
  comfyui-workflow/
  image-viewer/

tests/
  e2e/
```

职责划分：

- `apps/web`：浏览器宿主、画布编辑、插件 iframe 挂载、运行控制
- `apps/api`：项目 CRUD、插件注册表、运行记录、资产与公网 HTTPS 连接调用
- `apps/worker`：运行编排与提供方适配器
- `packages/protocol`：API 载荷类型、JSON Schema、事件契约
- `packages/asset-types`：标准资产枚举与辅助方法
- `packages/workflow-core`：DAG 校验、运行快照创建、缓存键辅助方法
- `packages/plugin-sdk`：Manifest 与节点定义编写辅助方法
- `packages/ui-sdk`：面向插件的 iframe JSON-RPC 客户端
- `packages/plugin-runtime`：宿主侧 iframe 桥接与权限校验
- `plugins/*`：只使用公开 SDK 包实现的官方插件
- `tests/e2e`：带模拟 RAGFlow 与 ComfyUI 的 Playwright 冒烟路径

## 任务 1：搭建 Monorepo 骨架

**文件：**
- 新增：`package.json`
- 新增：`pnpm-workspace.yaml`
- 新增：`turbo.json`
- 新增：`tsconfig.base.json`
- 新增：`.gitignore`
- 新增：`apps/web/package.json`
- 新增：`apps/api/package.json`
- 新增：`apps/worker/package.json`
- 新增：`packages/protocol/package.json`
- 新增：`packages/asset-types/package.json`
- 新增：`packages/workflow-core/package.json`
- 新增：`packages/plugin-sdk/package.json`
- 新增：`packages/ui-sdk/package.json`
- 新增：`packages/plugin-runtime/package.json`
- 新增：`tests/e2e/package.json`
- 测试：`tests/repo/workspace-smoke.test.ts`

- [ ] **步骤 1：先写一个会失败的工作区冒烟测试**

```ts
// tests/repo/workspace-smoke.test.ts
import { describe, expect, it } from "vitest";
import rootPackage from "../../package.json";

describe("workspace scaffold", () => {
  it("defines all top-level workspaces needed for phase 1", () => {
    expect(rootPackage.workspaces).toEqual([
      "apps/*",
      "packages/*",
      "plugins/*",
      "tests/*",
    ]);
  });
});
```

- [ ] **步骤 2：运行测试并确认它会失败**

运行：`pnpm vitest tests/repo/workspace-smoke.test.ts`

预期：因根工作区文件尚不存在，测试应以 `Cannot find module '../../package.json'` 或 `rootPackage.workspaces` 不匹配而失败。

- [ ] **步骤 3：写出最小可用的 Monorepo 骨架**

```json
// package.json
{
  "name": "plugin-first-ai-canvas",
  "private": true,
  "packageManager": "pnpm@10.12.1",
  "workspaces": ["apps/*", "packages/*", "plugins/*", "tests/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@types/node": "^24.0.1",
    "turbo": "^2.0.14",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"
  - "tests/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "test": { "dependsOn": ["^test"] },
    "typecheck": { "dependsOn": ["^typecheck"] }
  }
}
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@protocol/*": ["packages/protocol/src/*"],
      "@asset-types/*": ["packages/asset-types/src/*"],
      "@workflow-core/*": ["packages/workflow-core/src/*"],
      "@plugin-sdk/*": ["packages/plugin-sdk/src/*"],
      "@ui-sdk/*": ["packages/ui-sdk/src/*"],
      "@plugin-runtime/*": ["packages/plugin-runtime/src/*"]
    }
  }
}
```

- [ ] **步骤 4：运行冒烟测试并检查安装流程**

运行：`pnpm install && pnpm vitest tests/repo/workspace-smoke.test.ts`

预期：通过，并显示 `1 passed`。

- [ ] **步骤 5：提交代码**

```bash
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .gitignore apps packages tests
git commit -m "chore: scaffold monorepo workspace"
```

## 任务 2：定义共享协议、资产类型与 DAG 契约

**文件：**
- 新增：`packages/asset-types/src/core.ts`
- 新增：`packages/asset-types/src/index.ts`
- 新增：`packages/protocol/src/assets.ts`
- 新增：`packages/protocol/src/plugin-manifest.ts`
- 新增：`packages/protocol/src/workflow.ts`
- 新增：`packages/protocol/src/index.ts`
- 新增：`packages/workflow-core/src/graph.ts`
- 新增：`packages/workflow-core/src/snapshot.ts`
- 新增：`packages/workflow-core/src/index.ts`
- 测试：`packages/protocol/src/index.test.ts`
- 测试：`packages/workflow-core/src/index.test.ts`

- [ ] **步骤 1：先写会失败的 Schema 与图结构测试**

```ts
// packages/protocol/src/index.test.ts
import { describe, expect, it } from "vitest";
import { AssetRefSchema, PluginManifestSchema } from "./index";

describe("protocol schemas", () => {
  it("accepts a core image asset ref", () => {
    const result = AssetRefSchema.safeParse({
      id: "asset_1",
      type: "core/image",
      mimeType: "image/png",
      version: 1,
      size: 42,
      checksum: "abc",
      metadata: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects manifest without id", () => {
    const result = PluginManifestSchema.safeParse({
      schemaVersion: "1.0",
      name: "broken",
      version: "0.0.1",
      engine: { host: "^1.0.0", sdk: "^1.0.0" },
      entrypoints: { ui: "https://example.com/plugin/index.html" },
      contributes: {},
      permissions: [],
    });
    expect(result.success).toBe(false);
  });
});
```

```ts
// packages/workflow-core/src/index.test.ts
import { describe, expect, it } from "vitest";
import { topologicallySortNodes } from "./graph";

describe("workflow graph", () => {
  it("returns a stable topological order for a DAG", () => {
    const order = topologicallySortNodes(
      ["text", "search", "compose"],
      [
        { source: "text", target: "search" },
        { source: "search", target: "compose" },
      ],
    );

    expect(order).toEqual(["text", "search", "compose"]);
  });
});
```

- [ ] **步骤 2：运行测试并确认它们会失败**

运行：`pnpm vitest packages/protocol/src/index.test.ts packages/workflow-core/src/index.test.ts`

预期：以 `Cannot find module './index'` 和 `Cannot find module './graph'` 失败。

- [ ] **步骤 3：实现最小共享契约**

```ts
// packages/asset-types/src/core.ts
export const CoreAssetTypes = [
  "core/text",
  "core/prompt",
  "core/json",
  "core/image",
  "core/knowledge-context",
] as const;

export type CoreAssetType = (typeof CoreAssetTypes)[number];
```

```ts
// packages/protocol/src/assets.ts
import { z } from "zod";

export const AssetRefSchema = z.object({
  id: z.string(),
  type: z.string(),
  mimeType: z.string(),
  version: z.number().int().positive(),
  size: z.number().int().nonnegative(),
  checksum: z.string(),
  metadata: z.record(z.string(), z.unknown()),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;
```

```ts
// packages/protocol/src/plugin-manifest.ts
import { z } from "zod";

export const PluginManifestSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  engine: z.object({
    host: z.string().min(1),
    sdk: z.string().min(1),
  }),
  entrypoints: z.object({
    ui: z.string().url(),
    executor: z.string().url().optional(),
    webhook: z.string().url().optional(),
  }),
  contributes: z.record(z.string(), z.array(z.unknown())).default({}),
  permissions: z.array(z.string()),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
```

```ts
// packages/workflow-core/src/graph.ts
type Edge = { source: string; target: string };

export function topologicallySortNodes(nodes: string[], edges: Edge[]): string[] {
  const incoming = new Map(nodes.map((node) => [node, 0]));
  const outgoing = new Map(nodes.map((node) => [node, [] as string[]]));

  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const queue = nodes.filter((node) => incoming.get(node) === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const target of outgoing.get(node) ?? []) {
      incoming.set(target, (incoming.get(target) ?? 1) - 1);
      if (incoming.get(target) === 0) {
        queue.push(target);
      }
    }
  }

  if (order.length !== nodes.length) {
    throw new Error("Cycle detected");
  }

  return order;
}
```

- [ ] **步骤 4：运行共享包测试**

运行：`pnpm vitest packages/protocol/src/index.test.ts packages/workflow-core/src/index.test.ts`

预期：两个测试套件都通过。

- [ ] **步骤 5：提交代码**

```bash
git add packages/asset-types packages/protocol packages/workflow-core
git commit -m "feat: add shared protocol and workflow contracts"
```

## 任务 3：构建 API 数据模型与 CRUD 表面

**文件：**
- 新增：`apps/api/prisma/schema.prisma`
- 新增：`apps/api/src/app.module.ts`
- 新增：`apps/api/src/modules/projects/projects.controller.ts`
- 新增：`apps/api/src/modules/projects/projects.service.ts`
- 新增：`apps/api/src/modules/plugins/plugins.controller.ts`
- 新增：`apps/api/src/modules/plugins/plugins.service.ts`
- 新增：`apps/api/src/modules/connections/connections.controller.ts`
- 新增：`apps/api/src/modules/connections/connections.service.ts`
- 新增：`apps/api/src/modules/runs/runs.controller.ts`
- 新增：`apps/api/src/modules/runs/runs.service.ts`
- 新增：`apps/api/src/modules/assets/assets.service.ts`
- 新增：`apps/api/src/modules/database/database.service.ts`
- 测试：`apps/api/src/modules/projects/projects.service.spec.ts`
- 测试：`apps/api/src/modules/runs/runs.service.spec.ts`

- [ ] **步骤 1：先写会失败的服务测试**

```ts
// apps/api/src/modules/projects/projects.service.spec.ts
import { describe, expect, it } from "vitest";
import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  it("creates a project with an empty canvas document", async () => {
    const service = new ProjectsService({} as never);
    await expect(
      service.create({
        name: "Demo Project",
      }),
    ).resolves.toMatchObject({
      name: "Demo Project",
      document: { nodes: [], edges: [], groups: [] },
    });
  });
});
```

```ts
// apps/api/src/modules/runs/runs.service.spec.ts
import { describe, expect, it } from "vitest";
import { RunsService } from "./runs.service";

describe("RunsService", () => {
  it("creates a queued workflow run snapshot", async () => {
    const service = new RunsService({} as never, {} as never);
    await expect(
      service.create({
        projectId: "project_1",
        trigger: "manual",
        snapshot: { nodes: [], edges: [] },
      }),
    ).resolves.toMatchObject({
      status: "queued",
      projectId: "project_1",
    });
  });
});
```

- [ ] **步骤 2：运行 API 测试并确认它们会失败**

运行：`pnpm --filter api vitest src/modules/projects/projects.service.spec.ts src/modules/runs/runs.service.spec.ts`

预期：由于服务模块缺失以及 NestJS/Prisma 骨架未完成而失败。

- [ ] **步骤 3：实现 Prisma Schema 与最小服务层**

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id        String   @id @default(cuid())
  name      String
  document  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  runs      WorkflowRun[]
}

model WorkflowRun {
  id        String   @id @default(cuid())
  projectId String
  trigger   String
  status    String
  snapshot  Json
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

```ts
// apps/api/src/modules/projects/projects.service.ts
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ProjectsService {
  constructor(private readonly database: DatabaseService) {}

  create(input: { name: string }) {
    return this.database.project.create({
      data: {
        name: input.name,
        document: {
          schemaVersion: "1.0",
          nodes: [],
          edges: [],
          groups: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
    });
  }
}
```

```ts
// apps/api/src/modules/runs/runs.service.ts
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class RunsService {
  constructor(private readonly database: DatabaseService) {}

  create(input: { projectId: string; trigger: string; snapshot: unknown }) {
    return this.database.workflowRun.create({
      data: {
        projectId: input.projectId,
        trigger: input.trigger,
        status: "queued",
        snapshot: input.snapshot,
      },
    });
  }
}
```

- [ ] **步骤 4：运行迁移并执行 API 测试**

运行：`pnpm --filter api prisma migrate dev --name init && pnpm --filter api vitest src/modules/projects/projects.service.spec.ts src/modules/runs/runs.service.spec.ts`

预期：通过，并显示 `2 passed`。

- [ ] **步骤 5：提交代码**

```bash
git add apps/api
git commit -m "feat: add api persistence and run primitives"
```

## 任务 4：构建 Web 宿主画布与项目持久化

**文件：**
- 新增：`apps/web/src/app/page.tsx`
- 新增：`apps/web/src/features/canvas/canvas-page.tsx`
- 新增：`apps/web/src/features/canvas/canvas-store.ts`
- 新增：`apps/web/src/features/canvas/node-card.tsx`
- 新增：`apps/web/src/features/projects/use-project-query.ts`
- 新增：`apps/web/src/features/runs/run-toolbar.tsx`
- 测试：`apps/web/src/features/canvas/canvas-page.test.tsx`

- [ ] **步骤 1：先写会失败的画布集成测试**

```tsx
// apps/web/src/features/canvas/canvas-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CanvasPage } from "./canvas-page";

describe("CanvasPage", () => {
  it("renders a canvas, plugin sidebar, and run button", () => {
    render(<CanvasPage />);

    expect(screen.getByText("Project Canvas")).toBeInTheDocument();
    expect(screen.getByText("Installed Plugins")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run Workflow" })).toBeInTheDocument();
  });
});
```

- [ ] **步骤 2：运行 Web 测试并确认它会失败**

运行：`pnpm --filter web vitest src/features/canvas/canvas-page.test.tsx`

预期：由于页面和测试工具尚不存在而失败。

- [ ] **步骤 3：实现画布宿主外壳**

```tsx
// apps/web/src/features/canvas/canvas-page.tsx
"use client";

import { ReactFlow, Background, Controls } from "@xyflow/react";
import { RunToolbar } from "../runs/run-toolbar";

export function CanvasPage() {
  return (
    <main className="grid min-h-screen grid-cols-[280px_1fr]">
      <aside className="border-r p-4">
        <h2 className="text-lg font-semibold">Installed Plugins</h2>
      </aside>
      <section className="relative">
        <header className="flex items-center justify-between border-b p-4">
          <h1 className="text-2xl font-semibold">Project Canvas</h1>
          <RunToolbar />
        </header>
        <div className="h-[calc(100vh-81px)]">
          <ReactFlow nodes={[]} edges={[]} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </section>
    </main>
  );
}
```

```tsx
// apps/web/src/features/runs/run-toolbar.tsx
export function RunToolbar() {
  return (
    <button className="rounded bg-black px-4 py-2 text-white" type="button">
      Run Workflow
    </button>
  );
}
```

```tsx
// apps/web/src/app/page.tsx
import { CanvasPage } from "../features/canvas/canvas-page";

export default function HomePage() {
  return <CanvasPage />;
}
```

- [ ] **步骤 4：运行 Web 测试并做一次本地冒烟构建**

运行：`pnpm --filter web vitest src/features/canvas/canvas-page.test.tsx && pnpm --filter web next build`

预期：Vitest 通过，且 Next.js 构建成功。

- [ ] **步骤 5：提交代码**

```bash
git add apps/web
git commit -m "feat: add web host canvas shell"
```

## 任务 5：实现工作流快照与 Worker 执行链路

**文件：**
- 新增：`packages/workflow-core/src/cache-key.ts`
- 新增：`packages/workflow-core/src/validate-run.ts`
- 新增：`apps/worker/src/queue.ts`
- 新增：`apps/worker/src/run-workflow.ts`
- 新增：`apps/worker/src/providers/plugin-executor.ts`
- 新增：`apps/api/src/modules/runs/run-dispatcher.service.ts`
- 测试：`packages/workflow-core/src/validate-run.test.ts`
- 测试：`apps/worker/src/run-workflow.test.ts`

- [ ] **步骤 1：先写会失败的运行校验与 Worker 测试**

```ts
// packages/workflow-core/src/validate-run.test.ts
import { describe, expect, it } from "vitest";
import { createRunSnapshot } from "./validate-run";

describe("createRunSnapshot", () => {
  it("freezes node definitions and plugin versions into a snapshot", () => {
    const snapshot = createRunSnapshot({
      projectId: "project_1",
      nodes: [{ id: "node_1", plugin: { id: "text", version: "0.1.0" } }],
      edges: [],
    });

    expect(snapshot.projectId).toBe("project_1");
    expect(snapshot.nodes[0]?.plugin.version).toBe("0.1.0");
  });
});
```

```ts
// apps/worker/src/run-workflow.test.ts
import { describe, expect, it, vi } from "vitest";
import { runWorkflow } from "./run-workflow";

describe("runWorkflow", () => {
  it("executes nodes in dependency order", async () => {
    const executor = vi.fn(async ({ nodeId }: { nodeId: string }) => ({
      nodeId,
      outputs: {},
    }));

    await runWorkflow(
      {
        nodes: [{ id: "a" }, { id: "b" }],
        edges: [{ source: "a", target: "b" }],
      },
      executor,
    );

    expect(executor.mock.calls.map(([input]) => input.nodeId)).toEqual(["a", "b"]);
  });
});
```

- [ ] **步骤 2：运行 Worker 测试并确认它们会失败**

运行：`pnpm vitest packages/workflow-core/src/validate-run.test.ts apps/worker/src/run-workflow.test.ts`

预期：由于快照函数和 Worker 函数缺失而失败。

- [ ] **步骤 3：实现运行快照与执行逻辑**

```ts
// packages/workflow-core/src/validate-run.ts
import { topologicallySortNodes } from "./graph";

export function createRunSnapshot(input: {
  projectId: string;
  nodes: Array<{ id: string; plugin: { id: string; version: string } }>;
  edges: Array<{ source: string; target: string }>;
}) {
  topologicallySortNodes(
    input.nodes.map((node) => node.id),
    input.edges,
  );

  return {
    projectId: input.projectId,
    createdAt: new Date().toISOString(),
    nodes: input.nodes.map((node) => ({
      ...node,
      lockedAtRunStart: true,
    })),
    edges: input.edges,
  };
}
```

```ts
// apps/worker/src/run-workflow.ts
import { topologicallySortNodes } from "@workflow-core/graph";

type Snapshot = {
  nodes: Array<{ id: string }>;
  edges: Array<{ source: string; target: string }>;
};

export async function runWorkflow(
  snapshot: Snapshot,
  executeNode: (input: { nodeId: string }) => Promise<unknown>,
) {
  const order = topologicallySortNodes(
    snapshot.nodes.map((node) => node.id),
    snapshot.edges,
  );

  for (const nodeId of order) {
    await executeNode({ nodeId });
  }
}
```

- [ ] **步骤 4：运行 Worker 包测试**

运行：`pnpm vitest packages/workflow-core/src/validate-run.test.ts apps/worker/src/run-workflow.test.ts`

预期：两个测试套件都通过。

- [ ] **步骤 5：提交代码**

```bash
git add packages/workflow-core apps/worker apps/api/src/modules/runs
git commit -m "feat: add workflow snapshot and worker execution core"
```

## 任务 6：补齐插件运行时、UI SDK 与首批官方基础插件

**文件：**
- 新增：`packages/ui-sdk/src/client.ts`
- 新增：`packages/ui-sdk/src/index.ts`
- 新增：`packages/plugin-runtime/src/host.ts`
- 新增：`packages/plugin-runtime/src/permissions.ts`
- 新增：`plugins/text-input/manifest.json`
- 新增：`plugins/text-input/src/index.tsx`
- 新增：`plugins/brand-search/manifest.json`
- 新增：`plugins/brand-search/src/index.tsx`
- 新增：`plugins/prompt-compose/manifest.json`
- 新增：`plugins/prompt-compose/src/index.tsx`
- 新增：`plugins/comfyui-workflow/manifest.json`
- 新增：`plugins/comfyui-workflow/src/index.tsx`
- 新增：`plugins/image-viewer/manifest.json`
- 新增：`plugins/image-viewer/src/index.tsx`
- 测试：`packages/plugin-runtime/src/host.test.ts`

- [ ] **步骤 1：先写一个会失败的插件桥权限测试**

```ts
// packages/plugin-runtime/src/host.test.ts
import { describe, expect, it } from "vitest";
import { canUseCapability } from "./permissions";

describe("plugin runtime permissions", () => {
  it("rejects capabilities missing from the granted list", () => {
    expect(
      canUseCapability(["assets:create"], "jobs:create"),
    ).toBe(false);
  });
});
```

- [ ] **步骤 2：运行 runtime 测试并确认它会失败**

运行：`pnpm vitest packages/plugin-runtime/src/host.test.ts`

预期：由于 runtime 权限辅助方法缺失而失败。

- [ ] **步骤 3：实现 iframe 桥接以及首批五个官方插件**

```ts
// packages/plugin-runtime/src/permissions.ts
export function canUseCapability(grants: string[], capability: string) {
  return grants.includes(capability);
}
```

```ts
// packages/ui-sdk/src/client.ts
export function createPluginHost() {
  return {
    async call<T>(method: string, params: unknown): Promise<T> {
      window.parent.postMessage({ source: "plugin", method, params }, "*");
      return Promise.resolve(undefined as T);
    },
  };
}
```

```json
// plugins/text-input/manifest.json
{
  "schemaVersion": "1.0",
  "id": "core.text-input",
  "name": "Text Input",
  "version": "0.1.0",
  "engine": { "host": "^1.0.0", "sdk": "^1.0.0" },
  "entrypoints": { "ui": "http://localhost:4101/index.html" },
  "contributes": {
    "nodes": [
      {
        "type": "core.text-input/node",
        "title": "Text Input",
        "inputs": [],
        "outputs": [{ "id": "text", "type": "core/text" }]
      }
    ]
  },
  "permissions": []
}
```

```tsx
// plugins/text-input/src/index.tsx
import { createRoot } from "react-dom/client";

function App() {
  return <textarea aria-label="Text input" className="w-full rounded border p-2" />;
}

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **步骤 4：运行 runtime 测试，并在宿主中加载一个插件**

运行：`pnpm vitest packages/plugin-runtime/src/host.test.ts && pnpm --filter web dev`

预期：测试通过，且宿主至少能渲染来自 `plugins/text-input/manifest.json` 的一个插件节点定义。

- [ ] **步骤 5：提交代码**

```bash
git add packages/ui-sdk packages/plugin-runtime plugins
git commit -m "feat: add plugin runtime and official base plugins"
```

## 任务 7：接入公网 HTTPS 的 RAGFlow 与 ComfyUI 集成

**文件：**
- 新增：`apps/api/src/modules/connections/provider-adapters/ragflow.client.ts`
- 新增：`apps/api/src/modules/connections/provider-adapters/comfyui.client.ts`
- 新增：`apps/worker/src/providers/ragflow-search.ts`
- 新增：`apps/worker/src/providers/comfyui-run.ts`
- 修改：`plugins/brand-search/src/index.tsx`
- 修改：`plugins/comfyui-workflow/src/index.tsx`
- 测试：`apps/api/src/modules/connections/provider-adapters/ragflow.client.spec.ts`
- 测试：`apps/api/src/modules/connections/provider-adapters/comfyui.client.spec.ts`

- [ ] **步骤 1：先写会失败的提供方适配器测试**

```ts
// apps/api/src/modules/connections/provider-adapters/ragflow.client.spec.ts
import { describe, expect, it, vi } from "vitest";
import { RagflowClient } from "./ragflow.client";

describe("RagflowClient", () => {
  it("maps search results into knowledge-context items", async () => {
    const fetcher = vi.fn(async () => ({
      json: async () => ({
        data: {
          chunks: [
            {
              content: "Use warm stone neutrals",
              score: 0.91,
              document_id: "doc_1",
              chunk_id: "chunk_1",
            },
          ],
        },
      }),
    }));

    const client = new RagflowClient(fetcher as never);
    const result = await client.search({
      baseUrl: "https://ragflow.example.com",
      apiKey: "secret",
      datasetId: "dataset_1",
      query: "living room palette",
    });

    expect(result.items[0]?.text).toBe("Use warm stone neutrals");
  });
});
```

```ts
// apps/api/src/modules/connections/provider-adapters/comfyui.client.spec.ts
import { describe, expect, it, vi } from "vitest";
import { ComfyuiClient } from "./comfyui.client";

describe("ComfyuiClient", () => {
  it("submits a prompt and returns the ComfyUI prompt id", async () => {
    const fetcher = vi.fn(async () => ({
      json: async () => ({ prompt_id: "prompt_123" }),
    }));

    const client = new ComfyuiClient(fetcher as never);
    const result = await client.queuePrompt({
      baseUrl: "https://comfy.example.com",
      workflow: { nodes: [] },
    });

    expect(result.promptId).toBe("prompt_123");
  });
});
```

- [ ] **步骤 2：运行适配器测试并确认它们会失败**

运行：`pnpm --filter api vitest src/modules/connections/provider-adapters/ragflow.client.spec.ts src/modules/connections/provider-adapters/comfyui.client.spec.ts`

预期：由于提供方适配器尚不存在而失败。

- [ ] **步骤 3：实现公网 HTTPS 客户端与 Worker 处理器**

```ts
// apps/api/src/modules/connections/provider-adapters/ragflow.client.ts
export class RagflowClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async search(input: {
    baseUrl: string;
    apiKey: string;
    datasetId: string;
    query: string;
  }) {
    const response = await this.fetcher(
      `${input.baseUrl}/api/v1/retrieval`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.apiKey}`,
        },
        body: JSON.stringify({
          dataset_ids: [input.datasetId],
          question: input.query,
        }),
      },
    );

    const payload = await response.json();

    return {
      items: payload.data.chunks.map((chunk: any) => ({
        text: chunk.content,
        score: chunk.score,
        citation: {
          documentId: chunk.document_id,
          chunkId: chunk.chunk_id,
        },
      })),
    };
  }
}
```

```ts
// apps/api/src/modules/connections/provider-adapters/comfyui.client.ts
export class ComfyuiClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async queuePrompt(input: { baseUrl: string; workflow: unknown }) {
    const response = await this.fetcher(`${input.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input.workflow }),
    });

    const payload = await response.json();
    return { promptId: payload.prompt_id };
  }
}
```

```ts
// apps/worker/src/providers/ragflow-search.ts
import { RagflowClient } from "../../../apps/api/src/modules/connections/provider-adapters/ragflow.client";

export async function runRagflowSearch(client: RagflowClient, input: {
  baseUrl: string;
  apiKey: string;
  datasetId: string;
  query: string;
}) {
  return client.search(input);
}
```

- [ ] **步骤 4：运行提供方测试与官方插件集成冒烟测试**

运行：`pnpm --filter api vitest src/modules/connections/provider-adapters/ragflow.client.spec.ts src/modules/connections/provider-adapters/comfyui.client.spec.ts && pnpm test`

预期：适配器测试通过，且更大范围的测试套件依然通过。

- [ ] **步骤 5：提交代码**

```bash
git add apps/api/src/modules/connections apps/worker/src/providers plugins/brand-search plugins/comfyui-workflow
git commit -m "feat: add public ragflow and comfyui integrations"
```

## 任务 8：证明端到端核心闭环

**文件：**
- 新增：`tests/e2e/core-loop.spec.ts`
- 新增：`tests/e2e/fixtures/mock-ragflow.ts`
- 新增：`tests/e2e/fixtures/mock-comfyui.ts`
- 新增：`.github/workflows/ci.yml`
- 新增：`README.md`
- 修改：`apps/web/src/app/page.tsx`

- [ ] **步骤 1：先写一个会失败的 Playwright 场景**

```ts
// tests/e2e/core-loop.spec.ts
import { expect, test } from "@playwright/test";

test("user can search brand context and generate an image through ComfyUI", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Text Input").click();
  await page.getByLabel("Text input").fill("Warm minimalist living room");
  await page.getByText("Brand Search").click();
  await page.getByRole("button", { name: "Run Workflow" }).click();

  await expect(page.getByText("Generation Complete")).toBeVisible();
  await expect(page.getByRole("img", { name: "Workflow output" })).toBeVisible();
});
```

- [ ] **步骤 2：运行 e2e 测试并确认它会失败**

运行：`pnpm --filter e2e playwright test tests/e2e/core-loop.spec.ts`

预期：由于宿主尚不能渲染工作流、mocks 尚未挂载且运行状态 UI 缺失而失败。

- [ ] **步骤 3：补齐 mocks、运行状态 UI 与 CI 接线**

```ts
// tests/e2e/fixtures/mock-ragflow.ts
import { http, HttpResponse } from "msw";

export const ragflowHandlers = [
  http.post("https://ragflow.example.test/api/v1/retrieval", () =>
    HttpResponse.json({
      data: {
        chunks: [
          {
            content: "Use warm stone neutrals",
            score: 0.92,
            document_id: "doc_1",
            chunk_id: "chunk_1",
          },
        ],
      },
    }),
  ),
];
```

```ts
// tests/e2e/fixtures/mock-comfyui.ts
import { http, HttpResponse } from "msw";

export const comfyuiHandlers = [
  http.post("https://comfyui.example.test/prompt", () =>
    HttpResponse.json({ prompt_id: "prompt_1" }),
  ),
  http.get("https://comfyui.example.test/history/prompt_1", () =>
    HttpResponse.json({
      prompt_1: {
        outputs: {
          image: {
            images: [{ filename: "living-room.png" }],
          },
        },
      },
    }),
  ),
];
```

```yaml
# .github/workflows/ci.yml
name: ci

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.12.1
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm test
```

- [ ] **步骤 4：运行全部测试并完成一次完整冒烟构建**

运行：`pnpm test && pnpm build`

预期：全部 Vitest 与 Playwright 测试通过，随后 `web`、`api` 和 `worker` 均构建成功。

- [ ] **步骤 5：提交代码**

```bash
git add tests/e2e .github/workflows/ci.yml README.md apps/web/src/app/page.tsx
git commit -m "test: prove core plugin workflow loop end to end"
```

## 规格覆盖检查

本计划已覆盖：

- 核心闭环：插件安装、节点创建、DAG 运行、结果持久化
- 稳定的宿主外壳与 iframe 运行时
- 共享协议、资产引用、插件 Manifest、运行快照
- 项目、运行、资产、插件与公网连接的 API 持久化
- Worker 编排与运行状态持久化
- 通过公开 SDK 包实现的官方插件
- 公网 HTTPS 的 RAGFlow 与 ComfyUI 集成
- 端到端验证

第一阶段有意不覆盖：

- Docker Connector Agent
- 第三方发布与插件市场审核流程
- 导出与分享流程
- 多用户认证与工作区协作
- 高级控制流与更丰富的插件类别

## 占位符扫描

本计划有意避免使用 `TBD`、`TODO`、“与任务 N 类似” 以及未命名文件。每个任务都明确给出精确路径、测试命令与目标行为。

## 类型一致性检查

- `AssetRef`、`PluginManifestSchema` 与运行快照会先在共享包中定义，再供 API 或 Worker 任务使用。
- Worker 与 API 任务使用与规格一致的 `projectId`、`snapshot`、`status` 以及插件版本术语。
- 官方插件 ID 与节点类型会在运行时与集成任务之间保持稳定。

