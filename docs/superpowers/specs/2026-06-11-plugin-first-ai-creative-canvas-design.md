# 插件优先的 AI 创意画布设计规格

日期：2026-06-11

状态：已完成产品讨论，待用户审阅

首版形态：Web SaaS

目标用户：通用 AI 创作者与插件开发者

## 1. 产品目标

构建一个通用 AI 创意工作台。用户在无限画布上安装插件、创建节点、连接工作流、执行任务，并查看、复用和导出生成资产。

产品采用“稳定宿主内核 + 全业务插件化”架构：

- 宿主内核只负责画布文档、插件运行时、资产、权限、凭证、工作流调度和项目持久化。
- 文本处理、模型调用、图片生成、品牌检索、文件导出等业务能力全部由插件实现。
- 官方插件与第三方插件使用相同的公开规范和 SDK，不允许依赖私有宿主接口。
- 第三方插件 UI 在浏览器沙箱中运行，第三方服务端代码由开发者自行托管。

首版要验证的核心闭环是：

```text
安装插件
→ 创建节点
→ 跨插件连线
→ 执行 DAG
→ 查看和复用产物
```

## 2. 首版范围

### 2.1 包含

- 单人 Web 项目和云端保存。
- 无限画布、节点、连线、分组、注释、缩放和平移。
- 撤销、重做和项目恢复。
- 类型化端口和无环 DAG。
- 插件市场、插件安装、升级、禁用和卸载。
- 第三方插件沙箱及权限授权。
- 插件开发、调试、打包、签名和发布 SDK。
- 工作流运行、进度、日志、重试、取消和缓存。
- 平台资产库、对象存储和资产版本。
- 平台密钥保险库和受控请求代理。
- 公网 HTTPS 外部实例连接。
- Docker Connector Agent 内网连接。
- RAGFlow 品牌知识官方插件。
- ComfyUI 工作流官方插件。
- 项目快照分享和项目导入导出。

### 2.2 不包含

- 多人实时协作。
- 插件付费、评分、订阅和收入分成。
- 第三方后端代码托管。
- 任意网络访问或通用内网代理。
- 循环、条件分支和动态节点展开。
- 移动端完整编辑。
- 完整视频时间线编辑器。
- 完整 3D 建模器。
- 设计行业专属能力进入内核。
- 自动向所有生成任务隐式注入品牌上下文。

### 2.3 首版验收标准

- 开发者可在 30 分钟内创建并运行一个远程节点插件。
- 六个基础官方插件全部只使用公开 SDK。
- RAGFlow 和 ComfyUI 集成也只使用公开插件协议。
- 跨插件工作流可以保存、关闭、重开、执行、失败重试和导出。
- 插件 UI 崩溃不会导致宿主页面崩溃或项目损坏。
- 历史运行固定插件和 ComfyUI Workflow 版本，可追溯和复现。
- 密钥不进入插件 iframe、画布文档、节点日志或资产元数据。
- 删除或缺失插件时，项目结构和历史产物仍然保留。

## 3. 核心设计原则

1. 画布是稳定内核，不是插件。
2. 所有业务功能均通过插件扩展点实现。
3. 官方插件不得拥有第三方插件无法获得的隐式权限。
4. 插件之间不直接调用，只交换标准资产和宿主事件。
5. 工作流运行必须生成不可变快照。
6. 原始文件由平台资产库管理，外部系统只作为索引或执行引擎。
7. 用户必须显式连接品牌检索节点，不进行隐藏的上下文注入。
8. 外部调用默认最小权限、短期令牌、可审计和可撤销。
9. 首版优先可靠闭环，不提前建设微服务、复杂市场和高级控制流。

## 4. 总体架构

系统采用“模块化单体控制面 + 独立 Worker + 插件沙箱 + 外部连接器”的架构。

```text
浏览器
├── Web 宿主
│   ├── 无限画布
│   ├── 项目与资产界面
│   ├── 插件市场
│   └── 插件 iframe 沙箱
│
平台控制面
├── 身份与项目
├── 插件注册表
├── 权限与授权
├── DAG 校验与运行快照
├── 密钥保险库
├── 连接管理
└── 审计与配额
│
任务执行面
├── 调度 Worker
├── 插件远程 API 代理
├── 公网实例连接
└── Connector Agent 通道
│
外部系统
├── 插件开发者 API
├── 用户自有 RAGFlow
└── 用户自有 ComfyUI
```

### 4.1 Web 宿主

负责：

- 画布文档编辑和呈现。
- 节点端口连接和类型提示。
- 项目、资产和运行历史界面。
- 插件市场和授权界面。
- 插件 iframe 生命周期。
- JSON-RPC 消息桥。
- 宿主主题、语言、通知和对话框。

Web 宿主不负责具体模型调用、提示词生成、品牌检索或媒体处理。

### 4.2 平台控制面

采用模块化单体，包含：

- 用户和工作区模块。
- 项目和画布文档模块。
- 资产和版本模块。
- 插件注册表和安装模块。
- 权限、授权和审计模块。
- 工作流定义和运行快照模块。
- 外部连接和 Agent 设备模块。
- 密钥保险库模块。
- Webhook 和任务状态聚合模块。

模块之间通过明确的内部服务接口通信，未来可按实际负载拆分。

### 4.3 任务执行面

Worker 负责：

- 解析运行快照。
- 按依赖调度节点。
- 并行运行无依赖冲突的节点。
- 请求远程插件执行器。
- 通过公网或 Agent 调用外部实例。
- 管理超时、重试、取消和幂等。
- 收集进度、日志和产物。
- 将最终产物写入平台资产库。

## 5. 画布文档模型

画布文档只保存声明式数据，不保存组件实例、函数或运行时连接。

### 5.1 核心对象

```ts
interface CanvasDocument {
  schemaVersion: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  viewport: Viewport;
}

interface CanvasNode {
  id: string;
  plugin: {
    id: string;
    version: string;
  };
  type: string;
  definitionVersion: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  config: Record<string, unknown>;
  uiState?: Record<string, unknown>;
}

interface CanvasEdge {
  id: string;
  source: { nodeId: string; portId: string };
  target: { nodeId: string; portId: string };
}
```

### 5.2 内核职责

- 节点与边的增删改。
- 端口连接规则。
- 撤销和重做。
- 复制、粘贴、分组和注释。
- 画布文档 Schema 迁移。
- 自动保存和冲突检测。
- 缺失插件占位节点。

### 5.3 非内核职责

- 节点业务参数含义。
- 模型和供应商选择。
- 文件解析。
- 图片和视频生成。
- 品牌知识检索。
- 业务资产预览。

这些能力由插件声明和实现。

## 6. 工作流和执行模型

### 6.1 节点定义

```ts
interface NodeDefinition {
  type: string;
  version: string;
  title: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  configSchema: JSONSchema;
  execution: {
    mode: "remote";
    timeoutSeconds: number;
    retryPolicy: RetryPolicy;
    cacheable: boolean;
  };
}
```

### 6.2 标准运行方式

- 运行单个节点。
- 从指定节点向后运行。
- 运行完整工作流。

运行前平台执行：

1. 校验端口类型。
2. 校验必填输入。
3. 校验节点配置。
4. 校验插件权限和连接状态。
5. 固定插件精确版本。
6. 生成不可变 `RunSnapshot`。

### 6.3 调度规则

- 首版只执行无环 DAG。
- 可运行节点按依赖关系并行调度。
- 每个节点拥有独立状态、日志、进度和产物。
- 节点失败不会删除已成功产物。
- 重试不重复运行输入未变化的成功节点。
- 可缓存节点使用节点定义版本、输入摘要、配置摘要和执行器版本生成缓存键。
- 缓存复用必须记录来源运行。

### 6.4 未来兼容

数据模型预留 `control-flow` 类型，但首版不支持循环、条件和动态展开，也不在 UI 中暴露这些能力。

## 7. 资产模型

### 7.1 标准资产类型

- `core/text`
- `core/prompt`
- `core/json`
- `core/image`
- `core/image-mask`
- `core/audio`
- `core/video`
- `core/file`
- `core/table`
- `core/model-3d`
- `core/knowledge-context`
- `core/collection<T>`

插件可注册自定义类型，名称必须使用：

```text
<plugin-id>/<type-name>
```

### 7.2 资产引用

```ts
interface AssetRef {
  id: string;
  type: string;
  mimeType: string;
  version: number;
  size: number;
  checksum: string;
  metadata: Record<string, unknown>;
}
```

资产本体存储在 S3 兼容对象存储中。画布、SDK 消息桥和执行协议只传递 `AssetRef`，需要访问文件时由平台签发短期、单文件、单操作的 URL。

### 7.3 主数据规则

- 平台资产库是所有品牌文件和生成产物的唯一主数据源。
- 外部系统中的临时 URL 不能成为项目长期引用。
- 资产更新创建新版本，不原地覆盖历史版本。
- 工作流运行引用精确资产版本。

## 8. 插件扩展模型

### 8.1 支持的扩展点

- `nodes`：工作流节点。
- `panels`：侧边栏面板。
- `commands`：命令与快捷键。
- `menus`：画布、节点和资产菜单。
- `viewers`：资产预览器。
- `inspectors`：节点属性编辑器。
- `settings`：插件设置页。
- `importers`：文件导入器。
- `exporters`：文件导出器。
- `assetTypes`：自定义资产类型。

### 8.2 Manifest

```json
{
  "schemaVersion": "1.0",
  "id": "com.acme.image-tools",
  "name": "Image Tools",
  "version": "1.2.0",
  "engine": {
    "host": "^1.0.0",
    "sdk": "^1.0.0"
  },
  "entrypoints": {
    "ui": "https://cdn.acme.com/plugin/index.html",
    "executor": "https://api.acme.com/v1/execute",
    "webhook": "https://api.acme.com/v1/events"
  },
  "contributes": {
    "nodes": [],
    "panels": [],
    "commands": [],
    "menus": [],
    "viewers": [],
    "inspectors": [],
    "settings": [],
    "importers": [],
    "exporters": [],
    "assetTypes": []
  },
  "permissions": [
    "assets:read-workflow-inputs",
    "assets:create",
    "jobs:create",
    "secrets:use:provider-api-key",
    "network:api.acme.com"
  ]
}
```

### 8.3 版本规则

- 插件 ID 使用反向域名，并在首次发布后永久不变。
- 已发布版本不可覆盖，只能发布新版本或撤回。
- 项目保存精确插件版本。
- 平台保留已安装插件版本所需的签名 UI Bundle。
- 插件升级必须显式迁移旧节点配置。
- 新增权限的升级必须重新获取用户授权。
- 缺失插件显示占位节点，保留配置、连线和历史输出。

### 8.4 分发

首版支持：

- 官方插件市场。
- 人工审核后的第三方插件。
- 开发者本地调试安装。
- 版本发布、撤回和紧急禁用。

首版不支持付费、评分和分成。

## 9. 插件 SDK

SDK 拆分为：

```text
@platform/plugin-sdk
@platform/ui-sdk
@platform/executor-sdk
@platform/react
@platform/plugin-cli
@platform/plugin-testkit
```

### 9.1 `plugin-sdk`

提供：

- Manifest 类型和 JSON Schema。
- 节点、端口、资产和权限类型。
- 协议版本协商。
- Manifest 和节点定义校验。
- 插件兼容范围判断。

### 9.2 `ui-sdk`

插件 UI 运行在沙箱 iframe 中，通过 JSON-RPC 消息桥使用能力：

- `canvas`：读取选择、创建节点、定位视口。
- `assets`：选择、上传、读取元数据和创建派生资产。
- `projects`：读取当前项目的有限上下文。
- `commands`：注册和执行命令。
- `ui`：主题、语言、通知和受控对话框。
- `jobs`：提交、取消和监听任务。
- `secrets`：查询凭证是否配置，不能读取明文。
- `storage`：插件命名空间 KV。
- `events`：订阅允许暴露的宿主事件。

示例：

```ts
const host = await createPluginHost();

const selection = await host.canvas.getSelection();
const asset = await host.assets.pick({
  accept: ["core/image"]
});

host.commands.register({
  id: "remove-background",
  title: "移除背景",
  run: async () => {
    await host.jobs.create({
      nodeType: "com.acme.image-tools/remove-background",
      inputs: { image: asset }
    });
  }
});
```

### 9.3 `executor-sdk`

远程执行端点：

```http
POST /execute
Authorization: Bearer <short-lived-platform-token>
Idempotency-Key: <node-run-id>
Content-Type: application/json
```

请求：

```json
{
  "protocolVersion": "1.0",
  "plugin": "com.acme.image-tools@1.2.0",
  "nodeType": "com.acme.image-tools/remove-background",
  "nodeRunId": "nr_123",
  "inputs": {},
  "config": {},
  "callbackUrl": "https://platform.example/jobs/callback/token"
}
```

执行器可以：

- 同步返回产物。
- 返回 `202` 和 `externalJobId`。
- 通过签名 Webhook 上报进度、完成或失败。

SDK 提供请求验签、幂等处理、Webhook 客户端和错误类型。

### 9.4 CLI 与 Testkit

CLI 提供：

- 创建插件模板。
- 启动本地开发服务。
- 启动模拟宿主。
- 校验 Manifest 和 Schema。
- 执行兼容性测试。
- 打包和生成内容摘要。
- 签名和提交审核。

Testkit 提供：

- 模拟项目和画布。
- 模拟资产。
- 模拟权限授予和拒绝。
- 模拟节点运行。
- 协议契约测试。
- iframe 崩溃和重载测试。

## 10. 插件 UI 沙箱

第三方插件 UI 必须运行在独立源域名的 iframe。

通信链路：

```text
Plugin iframe
→ JSON-RPC request
→ origin/session/permission validation
→ Host capability handler
→ JSON-RPC response or event
```

默认限制：

- 不允许访问宿主 DOM。
- 不允许顶层导航。
- 不允许任意下载。
- 不允许摄像头和麦克风。
- 不允许默认读取剪贴板。
- 不允许直接访问平台 Cookie、LocalStorage 或数据库。
- 不允许直接访问其他插件。
- 网络连接受 CSP 和 Manifest 域名白名单限制。

宿主为每个插件会话签发短期令牌，绑定：

- 用户。
- 工作区。
- 项目。
- 插件 ID 和版本。
- 已授予权限。
- 会话有效期。

## 11. 权限模型

首版权限包括：

```text
canvas:read-selection
canvas:write
assets:read-selected
assets:read-workflow-inputs
assets:create
jobs:create
secrets:use:<credential-type>
network:<approved-domain>
storage:read
storage:write
```

规则：

- 插件只能读取用户明确选择的资产或工作流输入资产。
- 插件不能枚举项目内所有资产，除非未来新增独立高风险权限。
- 安装时展示静态权限。
- 敏感能力可在首次使用时进行运行时授权。
- 新版本新增权限时必须重新授权。
- 所有敏感操作写入审计日志。
- 平台可紧急禁用恶意插件版本。

## 12. 密钥与远程请求

### 12.1 密钥保险库

- 用户在宿主中配置供应商和外部实例凭证。
- 密钥使用云 KMS 加密。
- 插件只能查询凭证是否存在。
- 明文密钥只在服务端受控调用期间短暂解密。
- 日志、Webhook、画布文档和插件 UI 永不包含明文。
- 第三方远程执行器也不能接收用户密钥明文。
- `secrets:use:<credential-type>` 表示插件可以请求平台使用指定凭证执行已声明操作，不表示插件可以读取或转发凭证。

需要使用用户凭证时，远程执行器收到的是一次性 capability token。执行器使用该 token 调用平台的受控连接接口，由平台或 Connector Agent 完成实际供应商请求：

```text
Plugin Executor
→ opaque capability token
→ Platform Connection API
→ credential and operation validation
→ Public HTTPS or Connector Agent
→ Registered provider instance
```

capability token 必须绑定用户、工作区、插件版本、连接、允许操作、节点运行和有效期。远程执行器不能使用它调用未声明操作或其他连接。

### 12.2 请求代理

服务端请求代理负责：

- 注入用户授权的凭证。
- 校验插件、目标域名和请求操作。
- 防止 DNS 重绑定。
- 拒绝内网、本机和云元数据地址。
- 限制请求与响应大小。
- 限制内容类型、并发和超时。
- 用户、工作区和插件三级限流。
- 自动遮盖敏感请求头和日志字段。

已注册的内网实例只能通过 Connector Agent 访问，不经过通用请求代理。

## 13. Connector Agent

### 13.1 形态

首版只提供 Docker 容器。

Agent 主动向 SaaS 建立出站加密连接，不要求用户开放内网入站端口。

### 13.2 职责

- 注册 Agent 设备。
- 接收短期签名任务。
- 访问用户登记的 RAGFlow 或 ComfyUI 实例。
- 转发受允许的操作。
- 上报进度、结果和健康状态。
- 断线后安全重连。

### 13.3 安全限制

Agent 不是通用代理。每个请求必须同时匹配：

- 工作区。
- Agent 设备。
- 已登记实例。
- 插件。
- 操作类型。
- 允许的 API 路径。

Agent 不接受任意 URL，不允许访问未登记主机，并限制请求体、响应体、并发、超时和文件类型。

### 13.4 连接模式

平台向插件暴露统一连接接口：

- `public-https`：由平台 Worker 直接连接公网 HTTPS 实例。
- `connector-agent`：由 Agent 连接内网实例。

插件不需要了解底层连接模式。

## 14. RAGFlow 品牌知识插件

### 14.1 数据职责

平台资产库是品牌资产的唯一主数据源：

- S3 保存原始文件和版本。
- 数据库保存品牌、资产、权限和版本关系。
- RAGFlow 只保存解析后的文档、切片和索引。

RAGFlow 不作为图片、视频、字体或品牌文件的原始仓库。

### 14.2 品牌隔离

- 每个品牌对应一个独立 RAGFlow Dataset。
- 一个项目可以绑定多个品牌。
- 检索时必须指定一个或多个已绑定品牌。
- 检索结果保留品牌、资产版本、来源和相关度。

### 14.3 同步链路

```text
上传或更新品牌资产
→ 平台写入 S3 和资产数据库
→ 创建索引任务
→ 公网连接或 Connector Agent
→ 写入品牌对应的 RAGFlow Dataset
→ 保存平台资产与 RAGFlow document/chunk 映射
```

删除资产时，平台删除或失效对应 RAGFlow 文档。索引失败进入重试和人工修复队列，不影响平台原资产。

### 14.4 插件节点

首版提供：

- `Brand Dataset`：选择项目已绑定品牌。
- `Brand Search`：输入查询和检索参数，输出品牌上下文。
- `Knowledge Context Viewer`：查看片段、来源和相关度。
- `Prompt Composer`：将用户需求与品牌上下文显式组合。

`Brand Search` 输出 `core/knowledge-context`：

```ts
interface KnowledgeContext {
  query: string;
  items: Array<{
    text: string;
    score: number;
    brandId: string;
    asset: AssetRef;
    citation: {
      documentId: string;
      chunkId: string;
    };
  }>;
}
```

生成工作流必须显式连接该资产，不自动注入品牌知识。

## 15. ComfyUI 工作流插件

### 15.1 封装方式

- 用户导入 ComfyUI API Workflow JSON。
- 一个 ComfyUI Workflow 对应一个平台节点定义。
- 不把 ComfyUI 内部节点展开到平台画布。
- 用户显式映射公开输入、参数控件和输出节点。

### 15.2 Workflow 版本

平台保存：

- 原始 API Workflow JSON。
- 内容摘要。
- 映射配置。
- ComfyUI 兼容信息。
- 自定义节点依赖声明。
- 创建时间和创建者。

Workflow 修改后创建新版本。历史节点继续引用旧版本，不静默覆盖。

### 15.3 执行链路

```text
ComfyUI 平台节点
→ 解析输入 AssetRef
→ 上传或提供短期文件访问
→ 公网连接或 Connector Agent
→ 提交 ComfyUI prompt
→ 监听队列和执行进度
→ 回收输出文件
→ 写入平台资产库
→ 返回输出 AssetRef
```

插件支持：

- 提交。
- 队列状态。
- 执行进度。
- 取消。
- 历史状态查询。
- 结果回收。
- 错误标准化。

ComfyUI 的临时输出 URL 不进入画布长期数据。

## 16. 首批官方插件

基础创作套件：

1. `Text Input`
2. `Image Upload`
3. `LLM`
4. `Image Generation`
5. `Image Viewer`
6. `File Export`

外部系统套件：

7. `RAGFlow Brand Knowledge`
8. `ComfyUI Workflow`
9. `Connector Management`

其中 `LLM` 和通用 `Image Generation` 用于验证标准远程执行协议；ComfyUI 插件用于验证自有实例和长任务链路。

## 17. 错误模型

所有模块和插件统一返回：

```ts
interface PlatformError {
  code: string;
  category:
    | "validation"
    | "permission"
    | "connection"
    | "timeout"
    | "provider"
    | "internal";
  retryable: boolean;
  userMessage: string;
  technicalDetails?: Record<string, unknown>;
  traceId: string;
}
```

故障处理：

- 插件 UI 崩溃：重载对应 iframe。
- 插件远程 API 超时：按幂等策略重试。
- Agent 离线：任务进入等待状态，恢复连接后继续；首版默认最多等待 24 小时，超过期限后以可重试错误结束。
- RAGFlow 索引失败：保留平台资产并重试。
- ComfyUI 中断：查询 prompt/task 状态，无法恢复则失败。
- 插件缺失：显示占位节点。
- 工作流部分失败：保留成功节点和产物。

## 18. 可观测性

- 项目运行、节点运行、外部任务和 Agent 请求共享 `traceId`。
- 记录队列等待、执行时间、重试、缓存命中和资产传输耗时。
- Agent 上报在线状态、版本、延迟和实例健康。
- 用户可查看节点级运行日志。
- 平台审计记录安装、授权、密钥使用、资产访问和外部请求。
- 日志默认遮盖密钥、令牌、签名 URL、完整品牌内容和敏感提示词。

## 19. 测试策略

### 19.1 单元测试

- 画布文档命令和迁移。
- DAG 校验和拓扑调度。
- 类型兼容。
- 运行快照。
- 缓存键和失效。
- 插件版本解析。
- Manifest 和权限校验。

### 19.2 安全测试

- iframe 消息伪造。
- origin 和会话校验。
- 未授权 capability 调用。
- Webhook 重放。
- 签名过期。
- SSRF 和 DNS 重绑定。
- Agent 任意 URL 和未登记实例访问。
- 密钥及日志泄漏扫描。

### 19.3 契约测试

- SDK 与宿主协议兼容。
- 远程执行请求和响应。
- 异步任务与 Webhook。
- 公网连接和 Agent 连接行为一致。
- RAGFlow API 适配。
- ComfyUI API Workflow 和队列适配。

### 19.4 端到端测试

必须覆盖：

```text
上传品牌规范
→ 写入平台资产库
→ 同步 RAGFlow
→ 显式检索品牌上下文
→ 组装提示词
→ 调用 ComfyUI Workflow
→ 图片回存平台资产库
→ 关闭并重开项目
→ 从运行快照追溯和复现
```

## 20. 技术栈

- Monorepo：pnpm + Turborepo。
- Web：Next.js + React + TypeScript。
- 画布 UI：React Flow。
- 画布状态：Zustand + Immer。
- Schema：JSON Schema + Ajv。
- API 边界：Zod。
- 控制面：NestJS。
- 数据库：PostgreSQL + Prisma。
- 队列：Redis + BullMQ。
- 对象存储：S3 兼容接口，开发环境使用 MinIO。
- 身份认证：OIDC。
- 密钥：云 KMS，开发环境使用本地主密钥。
- 可观测性：OpenTelemetry + Sentry。
- 部署：Docker。

插件 UI 不强制使用 React，但平台提供 React Hooks 和设计系统组件。

## 21. 建议仓库结构

```text
apps/
  web/
  api/
  worker/
  connector-agent/

packages/
  canvas-core/
  workflow-core/
  plugin-runtime/
  plugin-sdk/
  ui-sdk/
  executor-sdk/
  plugin-cli/
  plugin-testkit/
  asset-types/
  design-system/
  protocol/

plugins/
  text-input/
  image-upload/
  llm/
  image-generation/
  image-viewer/
  file-export/
  ragflow-brand-knowledge/
  comfyui-workflow/
  connector-management/
```

插件市场属于 `api` 的独立业务模块，首版不单独部署 `plugin-registry` 服务。插件包和签名产物存入对象存储。

## 22. 数据实体

首版至少包含：

- `User`
- `Workspace`
- `Project`
- `CanvasDocument`
- `Asset`
- `AssetVersion`
- `Plugin`
- `PluginVersion`
- `PluginInstallation`
- `PermissionGrant`
- `WorkflowRun`
- `NodeRun`
- `RunSnapshot`
- `Credential`
- `ExternalConnection`
- `ConnectorAgent`
- `Brand`
- `BrandDatasetBinding`
- `RagflowDocumentMapping`
- `ComfyWorkflow`
- `ComfyWorkflowVersion`
- `AuditEvent`

## 23. 产品体验约束

- 插件 UI 必须使用宿主主题令牌，减少视觉碎片。
- 插件可以使用任意前端框架，但宿主不接受插件修改全局样式。
- 节点卡片的标题栏、端口、状态和错误展示由宿主统一渲染。
- 插件只负责节点参数区和自定义预览区。
- 权限请求必须解释用途和触发场景。
- 长任务必须显示排队、运行、等待 Agent、完成或失败状态。
- 品牌上下文必须可查看引用，避免“黑盒品牌提示词”。
- ComfyUI 节点必须展示 Workflow 版本、连接实例和缺失依赖。

## 24. 关键决策记录

- Web SaaS 优先，不做桌面宿主。
- 官方和第三方插件共用公开 SDK。
- 第三方后端由开发者托管。
- 无限画布属于内核。
- 插件支持多扩展点。
- DAG 由宿主统一编排。
- 插件交换标准资产和可扩展 Schema。
- 产品定位为通用 AI 创意工作台。
- 首版不做多人实时协作。
- 第三方 UI 使用沙箱 iframe。
- 密钥由平台保险库管理。
- 首版提供官方市场和本地调试安装。
- 首批使用基础创作插件验证闭环。
- RAGFlow 和 ComfyUI 使用用户自有实例。
- 同时支持公网 HTTPS 和 Docker Connector Agent。
- 每个品牌对应一个 RAGFlow Dataset。
- 一个 ComfyUI Workflow 对应一个平台节点。
- 平台资产库是品牌资产主数据源。
- 品牌知识通过显式检索节点进入生成工作流。
