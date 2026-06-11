"use client";

import { useMemo, useRef, useState } from "react";

import type {
  ComfyuiSettings,
  RagflowSettings,
} from "../connections/provider-config-panel";
import { RunToolbar } from "../runs/run-toolbar";

type BrandContext = {
  chunkId: string;
  documentId: string;
  score: number;
  text: string;
};

type WorkflowOutput = {
  filename: string;
  imageUrl: string;
  promptId: string;
};

type RunState = "idle" | "searching" | "ready" | "running" | "complete" | "error";

const workflowSteps = [
  {
    description: "记录这次空间效果图生成的创意方向。",
    id: "text-input",
    title: "文本输入",
  },
  {
    description: "从模拟的 RAGFlow 数据集中检索暖调品牌指引。",
    id: "brand-search",
    title: "品牌检索",
  },
  {
    description: "将提示词与检索出的品牌上下文进行拼装。",
    id: "prompt-compose",
    title: "提示词拼装",
  },
  {
    description: "提交模拟的 ComfyUI 工作流并读取其历史结果。",
    id: "comfyui-workflow",
    title: "ComfyUI 工作流",
  },
  {
    description: "展示工作流最终生成的图像结果。",
    id: "image-viewer",
    title: "图片预览",
  },
];

type CoreLoopProofProps = {
  comfyuiSettings: ComfyuiSettings;
  ragflowSettings: RagflowSettings;
};

export function CoreLoopProof({ comfyuiSettings, ragflowSettings }: CoreLoopProofProps) {
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [brandContext, setBrandContext] = useState<BrandContext | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [output, setOutput] = useState<WorkflowOutput | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [searchedPrompt, setSearchedPrompt] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState("text-input");
  const [textInput, setTextInput] = useState("");

  const trimmedPrompt = textInput.trim();
  const runStatusMessage = useMemo(() => {
    if (runState === "error") {
      return errorMessage ?? "工作流运行失败。";
    }

    switch (runState) {
      case "searching":
        return "正在检索品牌上下文...";
      case "ready":
        return "品牌上下文已就绪。";
      case "running":
        return "正在运行工作流...";
      case "complete":
        return "生成完成";
      default:
        return "准备验证核心闭环。";
    }
  }, [errorMessage, runState]);

  function handleTextInputClick() {
    setSelectedStepId("text-input");
    textInputRef.current?.focus();
  }

  function handleTextInputChange(nextValue: string) {
    setTextInput(nextValue);
    setBrandContext(null);
    setErrorMessage(null);
    setOutput(null);
    setRunState("idle");
    setSearchedPrompt(null);
  }

  async function fetchBrandContext(prompt: string): Promise<BrandContext> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (ragflowSettings.apiKey) {
      headers.Authorization = `Bearer ${ragflowSettings.apiKey}`;
    }

    const response = await fetch(`${stripTrailingSlash(ragflowSettings.baseUrl)}/api/v1/retrieval`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        dataset_ids: [ragflowSettings.datasetId],
        question: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`品牌检索失败，状态码：${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        chunks?: Array<{
          chunk_id: string;
          content: string;
          document_id: string;
          score: number;
        }>;
      };
    };
    const chunk = payload.data?.chunks?.[0];

    if (!chunk) {
      throw new Error("品牌检索未返回任何上下文。");
    }

    return {
      chunkId: chunk.chunk_id,
      documentId: chunk.document_id,
      score: chunk.score,
      text: chunk.content,
    };
  }

  async function ensureBrandContext(prompt: string): Promise<BrandContext> {
    if (brandContext && searchedPrompt === prompt) {
      return brandContext;
    }

    setRunState("searching");

    const context = await fetchBrandContext(prompt);
    setBrandContext(context);
    setSearchedPrompt(prompt);

    return context;
  }

  async function handleBrandSearch() {
    if (!trimmedPrompt) {
      setErrorMessage("请先输入提示词，再运行品牌检索。");
      setRunState("error");
      return;
    }

    setSelectedStepId("brand-search");
    setErrorMessage(null);
    setOutput(null);

    try {
      await ensureBrandContext(trimmedPrompt);
      setRunState("ready");
    } catch (error) {
      setRunState("error");
      setErrorMessage(error instanceof Error ? error.message : "品牌检索失败。");
    }
  }

  async function handleRunWorkflow() {
    if (!trimmedPrompt) {
      setErrorMessage("请先输入提示词，再运行工作流。");
      setRunState("error");
      return;
    }

    setSelectedStepId("comfyui-workflow");
    setErrorMessage(null);

    try {
      const context = await ensureBrandContext(trimmedPrompt);
      setRunState("running");

      const promptResponse = await fetch(`${stripTrailingSlash(comfyuiSettings.baseUrl)}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            brandContext: context.text,
            positivePrompt: `${trimmedPrompt}. ${context.text}.`,
          },
        }),
      });

      if (!promptResponse.ok) {
        throw new Error(`工作流入队失败，状态码：${promptResponse.status}`);
      }

      const promptPayload = (await promptResponse.json()) as {
        prompt_id?: string;
      };

      if (!promptPayload.prompt_id) {
        throw new Error("工作流入队后未返回提示 ID。");
      }

      const historyResponse = await fetch(
        `${stripTrailingSlash(comfyuiSettings.baseUrl)}/history/${promptPayload.prompt_id}`,
      );

      if (!historyResponse.ok) {
        throw new Error(`工作流历史查询失败，状态码：${historyResponse.status}`);
      }

      const historyPayload = (await historyResponse.json()) as {
        [promptId: string]: {
          outputs?: {
            image?: {
              images?: Array<{
                filename: string;
              }>;
            };
          };
        };
      };
      const filename =
        historyPayload[promptPayload.prompt_id]?.outputs?.image?.images?.[0]?.filename;

      if (!filename) {
        throw new Error("工作流历史结果中未包含图像输出。");
      }

      setOutput({
        filename,
        imageUrl: createWorkflowPreview(trimmedPrompt, context, filename),
        promptId: promptPayload.prompt_id,
      });
      setRunState("complete");
      setSelectedStepId("image-viewer");
    } catch (error) {
      setRunState("error");
      setErrorMessage(error instanceof Error ? error.message : "工作流运行失败。");
    }
  }

  return (
    <section
      aria-labelledby="core-loop-proof-heading"
      style={{
        borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
        display: "grid",
        gap: 20,
        padding: 24,
      }}
    >
      <header
        style={{
          alignItems: "start",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1fr) auto",
        }}
      >
        <div>
          <h3 id="core-loop-proof-heading" style={{ fontSize: 22, margin: 0 }}>
            核心闭环验证
          </h3>
          <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
            这个面板会在宿主外壳继续渲染插件清单与画布区域的前提下，通过模拟的 RAGFlow
            与 ComfyUI 响应来验证官方插件链路。当前会读取左侧配置中填写的地址。
          </p>
        </div>
        <RunToolbar
          disabled={runState === "searching" || runState === "running"}
          onRun={handleRunWorkflow}
        />
      </header>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.52)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 18,
            display: "grid",
            gap: 16,
            padding: 20,
          }}
        >
          <div
            aria-label="核心闭环步骤"
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            }}
          >
            {workflowSteps.map((step) => {
              const isSelected = step.id === selectedStepId;
              const clickHandler =
                step.id === "text-input" ? handleTextInputClick : () => setSelectedStepId(step.id);

              return (
                <button
                  aria-pressed={isSelected}
                  key={step.id}
                  onClick={clickHandler}
                  style={{
                    background: isSelected ? "rgba(56, 189, 248, 0.18)" : "rgba(15, 23, 42, 0.7)",
                    border: `1px solid ${isSelected ? "#38bdf8" : "rgba(148, 163, 184, 0.24)"}`,
                    borderRadius: 16,
                    color: "#e2e8f0",
                    cursor: "pointer",
                    display: "grid",
                    gap: 6,
                    minHeight: 112,
                    padding: 14,
                    textAlign: "left",
                  }}
                  type="button"
                >
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{step.title}</span>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{step.description}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="core-loop-text-input" style={{ fontSize: 15, fontWeight: 700 }}>
              文本输入
            </label>
            <textarea
              id="core-loop-text-input"
              onChange={(event) => handleTextInputChange(event.target.value)}
              placeholder="描述你想生成的图像"
              ref={textInputRef}
              rows={4}
              style={{
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 16,
                color: "#f8fafc",
                font: "inherit",
                minHeight: 120,
                padding: 16,
                resize: "vertical",
              }}
              value={textInput}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={handleBrandSearch}
              style={{
                background: "#1d4ed8",
                border: 0,
                borderRadius: 999,
                color: "#eff6ff",
                cursor: "pointer",
                fontWeight: 700,
                padding: "12px 18px",
              }}
              type="button"
            >
              品牌检索
            </button>
          </div>

          <div
            role="status"
            style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 16,
              color: runState === "error" ? "#fecaca" : "#e2e8f0",
              padding: 16,
            }}
          >
            <strong style={{ display: "block", marginBottom: 6 }}>运行状态</strong>
            <span>{runStatusMessage}</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.52)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 18,
            display: "grid",
            gap: 16,
            padding: 20,
          }}
        >
          <div>
            <h4 style={{ fontSize: 18, margin: 0 }}>模拟集成输出</h4>
            <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
              这里会保留来自 fixture 的关键返回值，确保这条验证链路展示的不只是一个成功状态。
            </p>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <strong>品牌上下文</strong>
            {brandContext ? (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  borderRadius: 16,
                  display: "grid",
                  gap: 8,
                  padding: 16,
                }}
              >
                <p style={{ margin: 0 }}>{brandContext.text}</p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  评分 {brandContext.score.toFixed(2)} | {brandContext.documentId} /{" "}
                  {brandContext.chunkId}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  来源：{ragflowSettings.baseUrl}
                </p>
              </div>
            ) : (
              <p style={{ color: "#94a3b8", margin: 0 }}>
                点击“品牌检索”以加载模拟的 RAGFlow 结果。
              </p>
            )}
          </div>

          {output ? (
            <figure style={{ display: "grid", gap: 12, margin: 0 }}>
              <img
                alt="工作流输出"
                src={output.imageUrl}
                style={{
                  borderRadius: 18,
                  display: "block",
                  width: "100%",
                }}
              />
              <figcaption style={{ color: "#94a3b8", fontSize: 13 }}>
                提示 ID：{output.promptId} | 输出文件名：{output.filename} | 来源：
                {comfyuiSettings.baseUrl}
              </figcaption>
            </figure>
          ) : (
            <div
              style={{
                alignItems: "center",
                border: "1px dashed rgba(148, 163, 184, 0.35)",
                borderRadius: 18,
                color: "#94a3b8",
                display: "grid",
                minHeight: 240,
                padding: 24,
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0 }}>
                运行工作流后，这里会显示模拟图片预览、提示 ID 和输出文件名。
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function createWorkflowPreview(
  prompt: string,
  context: BrandContext,
  filename: string,
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#f5ede3" />
          <stop offset="45%" stop-color="#d7c5b1" />
          <stop offset="100%" stop-color="#b08f72" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" rx="36" />
      <rect x="120" y="110" width="960" height="580" rx="32" fill="rgba(255,255,255,0.72)" />
      <text x="160" y="210" fill="#57534e" font-family="Arial, sans-serif" font-size="34" font-weight="700">
        工作流输出
      </text>
      <text x="160" y="278" fill="#44403c" font-family="Arial, sans-serif" font-size="28">
        ${escapeXml(prompt)}
      </text>
      <text x="160" y="338" fill="#78716c" font-family="Arial, sans-serif" font-size="24">
        ${escapeXml(context.text)}
      </text>
      <text x="160" y="622" fill="#57534e" font-family="Arial, sans-serif" font-size="22">
        ${escapeXml(filename)}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
