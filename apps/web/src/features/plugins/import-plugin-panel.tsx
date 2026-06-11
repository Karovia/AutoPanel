"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

import { loadPluginManifest } from "@package/plugin-runtime";
import type { PluginManifest } from "@package/protocol";

type ImportPluginPanelProps = {
  manifests: PluginManifest[];
  onImport: (manifest: PluginManifest) => void;
};

export function ImportPluginPanel({ manifests, onImport }: ImportPluginPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("尚未导入自定义插件。");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const manifestLike = JSON.parse(await readFileAsText(file)) as unknown;
      const loadedManifest = loadPluginManifest(manifestLike);

      onImport(loadedManifest.manifest);
      setStatusMessage(`已导入插件：${loadedManifest.manifest.name}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "插件导入失败。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section aria-labelledby="import-plugin-heading" style={{ display: "grid", gap: 12 }}>
      <div>
        <h2 id="import-plugin-heading" style={{ fontSize: 20, margin: 0 }}>
          导入插件
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "8px 0 0" }}>
          导入插件 Manifest JSON 文件后，插件会立即出现在当前宿主中。
        </p>
      </div>

      <input
        accept="application/json"
        hidden
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      <button
        onClick={() => inputRef.current?.click()}
        style={{
          background: "#0f172a",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          borderRadius: 999,
          color: "#e2e8f0",
          cursor: "pointer",
          fontWeight: 700,
          padding: "12px 18px",
        }}
        type="button"
      >
        选择插件文件
      </button>

      <p aria-live="polite" style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        {statusMessage}
      </p>

      {manifests.length ? (
        <div style={{ display: "grid", gap: 8 }}>
          {manifests.map((manifest) => (
            <div
              key={manifest.id}
              style={{
                background: "rgba(15, 23, 42, 0.72)",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>{manifest.name}</strong>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                {manifest.id} · {manifest.version}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

async function readFileAsText(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("插件文件读取失败。"));
    };
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };

    reader.readAsText(file);
  });
}
