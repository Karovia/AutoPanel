import { describe, expect, it } from "vitest";

import { plugin as brandSearchPlugin } from "../../plugins/brand-search/src/plugin";
import { plugin as comfyuiWorkflowPlugin } from "../../plugins/comfyui-workflow/src/plugin";
import { plugin as imageViewerPlugin } from "../../plugins/image-viewer/src/plugin";
import { plugin as promptComposePlugin } from "../../plugins/prompt-compose/src/plugin";
import { plugin as textInputPlugin } from "../../plugins/text-input/src/plugin";

const officialPlugins = [
  textInputPlugin,
  brandSearchPlugin,
  promptComposePlugin,
  comfyuiWorkflowPlugin,
  imageViewerPlugin,
];

describe("official plugins", () => {
  it("export sdk-backed plugin definitions with manifests and nodes", () => {
    expect(officialPlugins).toHaveLength(5);

    expect(
      officialPlugins.map((plugin) => ({
        id: plugin.manifest.id,
        nodeCount: plugin.nodes.length,
      })),
    ).toEqual([
      { id: "core.text-input", nodeCount: 1 },
      { id: "core.brand-search", nodeCount: 1 },
      { id: "core.prompt-compose", nodeCount: 1 },
      { id: "core.comfyui-workflow", nodeCount: 1 },
      { id: "core.image-viewer", nodeCount: 1 },
    ]);

    expect(
      officialPlugins.every(
        (plugin) =>
          JSON.stringify(plugin.manifest.contributes.nodes) === JSON.stringify(plugin.nodes),
      ),
    ).toBe(true);
  });
});
