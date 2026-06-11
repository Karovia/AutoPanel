# 插件优先的 AI 画布

第一阶段用于端到端验证核心创作闭环：

- 输入一段文本提示词
- 从 RAGFlow 检索模拟的品牌上下文
- 提交一个模拟的 ComfyUI 工作流
- 在 Web 应用中渲染生成结果预览

## 工作区命令

- `pnpm install`
- `pnpm test`
- `pnpm build`

## E2E 核心闭环

端到端验证位于 `tests/e2e/core-loop.spec.ts`，会驱动首页完成以下流程：

1. 选择 `Text Input`
2. 输入 `Warm minimalist living room`
3. 执行 `Brand Search`
4. 执行 `Run Workflow`
5. 断言出现 `Generation Complete`
6. 断言 `Workflow output` 图片可见

`tests/e2e/fixtures/mock-ragflow.ts` 和 `tests/e2e/fixtures/mock-comfyui.ts` 提供了确定性的 MSW 处理器，用来模拟该场景依赖的提供方请求。
