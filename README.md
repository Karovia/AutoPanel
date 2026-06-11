# 插件优先的 AI 画布

第一阶段用于端到端验证核心创作闭环：

- 输入一段文本提示词
- 从 RAGFlow 检索模拟的品牌上下文
- 提交一个模拟的 ComfyUI 工作流
- 在 Web 应用中渲染生成结果预览

当前仓库还包含一套已经接入的插件开发 SDK，以及 5 个使用该 SDK 定义的官方插件示例。

## 本阶段新增

- 官方插件迁移到统一的 `@package/plugin-sdk`
- 自定义插件支持导入后删除
- 新增插件 SDK 模板和开发者指南

## SDK 与文档

- SDK 入口：[packages/plugin-sdk](/Users/apple/Documents/New%20project%203/packages/plugin-sdk/README.md:1)
- 开发者指南：[docs/developers/plugin-sdk-guide.md](/Users/apple/Documents/New%20project%203/docs/developers/plugin-sdk-guide.md:1)
- 起步模板：
  - [packages/plugin-sdk/templates/basic-plugin/plugin.ts](/Users/apple/Documents/New%20project%203/packages/plugin-sdk/templates/basic-plugin/plugin.ts:1)
  - [packages/plugin-sdk/templates/basic-plugin/index.tsx](/Users/apple/Documents/New%20project%203/packages/plugin-sdk/templates/basic-plugin/index.tsx:1)

## 工作区命令

- `pnpm install`
- `pnpm test`
- `pnpm build`

## 插件现状

官方插件已经通过 SDK 定义：

- 文本输入
- 品牌检索
- 提示词拼装
- ComfyUI 工作流
- 图片预览

在宿主中：

- 可以导入插件 Manifest JSON
- 导入后的插件会出现在当前项目中
- 现在也支持删除已导入的自定义插件

## E2E 核心闭环

端到端验证位于 `tests/e2e/core-loop.spec.ts`，会驱动首页完成以下流程：

1. 选择 `Text Input`
2. 输入 `Warm minimalist living room`
3. 执行 `Brand Search`
4. 执行 `Run Workflow`
5. 断言出现 `Generation Complete`
6. 断言 `Workflow output` 图片可见

`tests/e2e/fixtures/mock-ragflow.ts` 和 `tests/e2e/fixtures/mock-comfyui.ts` 提供了确定性的 MSW 处理器，用来模拟该场景依赖的提供方请求。
