"use client";

import type { CSSProperties } from "react";

export type RagflowSettings = {
  apiKey: string;
  baseUrl: string;
  datasetId: string;
};

export type ComfyuiSettings = {
  baseUrl: string;
};

type ProviderConfigPanelProps = {
  comfyui: ComfyuiSettings;
  onComfyuiChange: (settings: ComfyuiSettings) => void;
  onRagflowChange: (settings: RagflowSettings) => void;
  onResetDefaults: () => void;
  onSave: () => void;
  ragflow: RagflowSettings;
};

export function ProviderConfigPanel({
  comfyui,
  onComfyuiChange,
  onRagflowChange,
  onResetDefaults,
  onSave,
  ragflow,
}: ProviderConfigPanelProps) {
  return (
    <section aria-labelledby="provider-config-heading" style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 id="provider-config-heading" style={{ fontSize: 20, margin: 0 }}>
          服务配置
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "8px 0 0" }}>
          当前应用与 RAGFlow、ComfyUI 部署在同一台服务器上，默认使用当前域名下的
          `/ragflow` 与 `/comfyui` 路径。
        </p>
      </div>

      <div
        style={{
          background: "rgba(15, 23, 42, 0.72)",
          border: "1px solid rgba(148, 163, 184, 0.24)",
          borderRadius: 12,
          display: "grid",
          gap: 12,
          padding: 16,
        }}
      >
        <h3 style={{ fontSize: 16, margin: 0 }}>RAGFlow 配置</h3>

        <label style={{ display: "grid", gap: 6 }}>
          <span>服务地址</span>
          <input
            onChange={(event) =>
              onRagflowChange({
                ...ragflow,
                baseUrl: event.target.value,
              })
            }
            style={inputStyle}
            type="url"
            value={ragflow.baseUrl}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>数据集 ID</span>
          <input
            onChange={(event) =>
              onRagflowChange({
                ...ragflow,
                datasetId: event.target.value,
              })
            }
            style={inputStyle}
            type="text"
            value={ragflow.datasetId}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>API Key</span>
          <input
            onChange={(event) =>
              onRagflowChange({
                ...ragflow,
                apiKey: event.target.value,
              })
            }
            placeholder="可选：服务端要求鉴权时再填写"
            style={inputStyle}
            type="password"
            value={ragflow.apiKey}
          />
        </label>
      </div>

      <div
        style={{
          background: "rgba(15, 23, 42, 0.72)",
          border: "1px solid rgba(148, 163, 184, 0.24)",
          borderRadius: 12,
          display: "grid",
          gap: 12,
          padding: 16,
        }}
      >
        <h3 style={{ fontSize: 16, margin: 0 }}>ComfyUI 配置</h3>

        <label style={{ display: "grid", gap: 6 }}>
          <span>服务地址</span>
          <input
            onChange={(event) =>
              onComfyuiChange({
                ...comfyui,
                baseUrl: event.target.value,
              })
            }
            style={inputStyle}
            type="url"
            value={comfyui.baseUrl}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onSave} style={primaryButtonStyle} type="button">
          保存配置
        </button>
        <button onClick={onResetDefaults} style={secondaryButtonStyle} type="button">
          恢复同服务器默认值
        </button>
      </div>
    </section>
  );
}

const inputStyle = {
  background: "rgba(15, 23, 42, 0.65)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: 12,
  color: "#f8fafc",
  font: "inherit",
  padding: "10px 12px",
} satisfies CSSProperties;

const primaryButtonStyle = {
  background: "#38bdf8",
  border: 0,
  borderRadius: 999,
  color: "#082f49",
  cursor: "pointer",
  fontWeight: 700,
  padding: "12px 18px",
} satisfies CSSProperties;

const secondaryButtonStyle = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  borderRadius: 999,
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 700,
  padding: "12px 18px",
} satisfies CSSProperties;
