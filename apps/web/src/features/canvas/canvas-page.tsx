"use client";

import { useMemo } from "react";

import { Background, Controls, ReactFlow } from "@xyflow/react";

import { createPluginHost } from "@package/plugin-runtime";

import { manifest as brandSearchManifest } from "../../../../../plugins/brand-search/src/plugin";
import { manifest as comfyuiWorkflowManifest } from "../../../../../plugins/comfyui-workflow/src/plugin";
import { manifest as imageViewerManifest } from "../../../../../plugins/image-viewer/src/plugin";
import { manifest as promptComposeManifest } from "../../../../../plugins/prompt-compose/src/plugin";
import { manifest as textInputManifest } from "../../../../../plugins/text-input/src/plugin";

import { ProviderConfigPanel } from "../connections/provider-config-panel";
import { useProviderSettings } from "../connections/use-provider-settings";
import { useProjectQuery } from "../projects/use-project-query";
import { ImportPluginPanel } from "../plugins/import-plugin-panel";
import { useImportedPluginManifests } from "../plugins/use-imported-plugin-manifests";
import { CoreLoopProof } from "./core-loop-proof";
import { createInitialCanvasState } from "./canvas-store";
import { NodeCard } from "./node-card";

const canvasState = createInitialCanvasState();
const officialPluginManifests = [
  textInputManifest,
  brandSearchManifest,
  promptComposeManifest,
  comfyuiWorkflowManifest,
  imageViewerManifest,
];

export function CanvasPage() {
  const { data: project, isLoading } = useProjectQuery();
  const projectName = project?.name ?? "项目画布";
  const installedPlugins = project?.installedPlugins ?? [];
  const { manifests: importedManifests, addManifest, removeManifest } = useImportedPluginManifests();
  const {
    comfyui,
    ragflow,
    resetDefaults,
    saveSettings,
    setComfyui,
    setRagflow,
    statusMessage,
  } = useProviderSettings();
  const allPluginManifests = useMemo(
    () => [
      ...officialPluginManifests,
      ...importedManifests,
    ],
    [importedManifests],
  );
  const officialNodeDefinitions = useMemo(
    () => createPluginHost({ manifests: allPluginManifests }).getNodeDefinitions(),
    [allPluginManifests],
  );
  const importedPluginSummaries = useMemo(
    () =>
      importedManifests.map((manifest) => ({
        description: `已导入插件 · ${manifest.id}`,
        id: manifest.id,
        name: manifest.name,
      })),
    [importedManifests],
  );
  const visibleInstalledPlugins = [...installedPlugins, ...importedPluginSummaries];

  return (
    <main
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "320px minmax(0, 1fr)",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <aside
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: 20,
          display: "grid",
          gap: 16,
          padding: 24,
        }}
      >
        <div>
          <p
            style={{
              color: "#38bdf8",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            宿主工作区
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 0" }}>项目画布</h1>
        </div>

        <section aria-labelledby="installed-plugins-heading" style={{ display: "grid", gap: 12 }}>
          <h2 id="installed-plugins-heading" style={{ fontSize: 20, margin: 0 }}>
            已安装插件
          </h2>
          {visibleInstalledPlugins.map((plugin) => (
            <NodeCard
              key={plugin.id}
              description={plugin.description}
              title={plugin.name}
            />
          ))}
          {!visibleInstalledPlugins.length ? (
            <p style={{ color: "#94a3b8", margin: 0 }}>
              {isLoading ? "正在加载已安装插件..." : "暂未安装任何插件。"}
            </p>
          ) : null}
        </section>

        <section aria-labelledby="official-node-types-heading" style={{ display: "grid", gap: 12 }}>
          <h2 id="official-node-types-heading" style={{ fontSize: 20, margin: 0 }}>
            官方节点类型
          </h2>
          {officialNodeDefinitions.map((node) => (
            <NodeCard
              key={node.type}
              description={`${node.pluginName} - ${node.type}`}
              title={node.title}
            />
          ))}
        </section>

        <ImportPluginPanel
          manifests={importedManifests}
          onImport={addManifest}
          onRemove={removeManifest}
        />

        <ProviderConfigPanel
          comfyui={comfyui}
          onComfyuiChange={setComfyui}
          onRagflowChange={setRagflow}
          onResetDefaults={resetDefaults}
          onSave={saveSettings}
          ragflow={ragflow}
        />

        <p aria-live="polite" style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
          {statusMessage}
        </p>
      </aside>

      <section
        aria-label="工作流画布"
        style={{
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.8))",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: 20,
          display: "grid",
          gridTemplateRows: "auto auto minmax(360px, 1fr)",
          minHeight: "calc(100vh - 48px)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            padding: 24,
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, margin: 0 }}>工作流画布</h2>
            <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
              {isLoading
                ? "正在加载 React Flow 宿主壳的占位项目数据。"
                : `${projectName} 的 React Flow 宿主壳，当前展示的是占位项目数据。`}
            </p>
          </div>
        </header>

        <CoreLoopProof comfyuiSettings={comfyui} ragflowSettings={ragflow} />

        <div style={{ minHeight: 360 }}>
          <ReactFlow
            edges={canvasState.edges}
            fitView
            nodes={canvasState.nodes}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#334155" gap={24} />
            <Controls />
          </ReactFlow>
        </div>
      </section>
    </main>
  );
}
