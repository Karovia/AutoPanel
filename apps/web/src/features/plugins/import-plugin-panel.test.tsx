import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ImportPluginPanel } from "./import-plugin-panel";

describe("ImportPluginPanel", () => {
  it("imports a plugin manifest from a local json file", async () => {
    const onImport = vi.fn();

    render(<ImportPluginPanel manifests={[]} onImport={onImport} onRemove={vi.fn()} />);

    const file = new File(
      [
        JSON.stringify({
          schemaVersion: "1.0",
          id: "acme.sample-plugin",
          name: "示例插件",
          version: "0.1.0",
          engine: { host: "^1.0.0", sdk: "^1.0.0" },
          entrypoints: { ui: "http://localhost:4999/index.html" },
          contributes: { nodes: [] },
          permissions: [],
        }),
      ],
      "sample-plugin.json",
      { type: "application/json" },
    );

    const input = document.querySelector('input[type="file"]');

    if (!input) {
      throw new Error("未找到文件输入框。");
    }

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "acme.sample-plugin",
          name: "示例插件",
        }),
      );
    });

    expect(await screen.findByText("已导入插件：示例插件")).toBeInTheDocument();
  });

  it("removes an imported plugin from the current host list", async () => {
    const onImport = vi.fn();
    const onRemove = vi.fn();

    render(
      <ImportPluginPanel
        manifests={[
          {
            schemaVersion: "1.0",
            id: "acme.sample-plugin",
            name: "示例插件",
            version: "0.1.0",
            engine: { host: "^1.0.0", sdk: "^1.0.0" },
            entrypoints: { ui: "http://localhost:4999/index.html" },
            contributes: { nodes: [] },
            permissions: [],
          },
        ]}
        onImport={onImport}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "删除示例插件" }));

    expect(onRemove).toHaveBeenCalledWith("acme.sample-plugin");
    expect(await screen.findByText("已删除插件：示例插件")).toBeInTheDocument();
  });
});
