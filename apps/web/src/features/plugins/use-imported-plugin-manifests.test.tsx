import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useImportedPluginManifests } from "./use-imported-plugin-manifests";

const STORAGE_KEY = "plugin-first-ai-canvas/imported-plugin-manifests";

describe("useImportedPluginManifests", () => {
  it("adds and removes imported manifests while keeping local storage in sync", async () => {
    const { result } = renderHook(() => useImportedPluginManifests());

    const manifest = {
      schemaVersion: "1.0" as const,
      id: "acme.sample-plugin",
      name: "示例插件",
      version: "0.1.0",
      engine: { host: "^1.0.0", sdk: "^1.0.0" },
      entrypoints: { ui: "http://localhost:4999/index.html" },
      contributes: { nodes: [] },
      permissions: [],
    };

    act(() => {
      result.current.addManifest(manifest);
    });

    await waitFor(() => {
      expect(result.current.manifests).toEqual([manifest]);
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain("acme.sample-plugin");
    });

    act(() => {
      result.current.removeManifest("acme.sample-plugin");
    });

    await waitFor(() => {
      expect(result.current.manifests).toEqual([]);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("[]");
    });
  });
});
