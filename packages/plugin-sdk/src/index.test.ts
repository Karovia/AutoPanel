import { describe, expect, it } from "vitest";

import {
  PLUGIN_PROTOCOL_VERSION,
  acceptExecutorJob,
  completeExecutorJob,
  createPluginHost,
  defineNode,
  definePlugin,
  definePluginManifest,
  type ExecutorRequest,
  PluginManifestSchema,
  PluginNodeSchema,
} from "./index";
import { acceptExecutorJob as acceptFromExecutor } from "./executor";
import { PluginManifestSchema as ProtocolManifestSchema } from "./protocol";
import { createPluginHost as createHostFromUi } from "./ui";

describe("plugin sdk", () => {
  it("validates a plugin manifest through the unified entry", () => {
    const manifest = definePluginManifest({
      schemaVersion: "1.0",
      id: "acme.gallery",
      name: "Gallery",
      version: "1.0.0",
      engine: {
        host: "^1.0.0",
        sdk: "^1.0.0",
      },
      entrypoints: {
        ui: "https://example.com/plugin/index.html",
      },
      contributes: {},
      permissions: [],
    });

    expect(manifest.id).toBe("acme.gallery");
    expect(PluginManifestSchema).toBe(ProtocolManifestSchema);
  });

  it("builds a plugin definition with validated nodes and manifest contributions", () => {
    const plugin = definePlugin({
      manifest: {
        schemaVersion: "1.0",
        id: "acme.gallery",
        name: "Gallery",
        version: "1.0.0",
        engine: {
          host: "^1.0.0",
          sdk: "^1.0.0",
        },
        entrypoints: {
          ui: "https://example.com/plugin/index.html",
          executor: "https://example.com/plugin/execute",
        },
        contributes: {
          commands: [{ id: "open-gallery" }],
        },
        permissions: ["jobs:create"],
      },
      nodes: [
        defineNode({
          type: "acme.gallery/search",
          title: "Search Gallery",
          inputs: [{ id: "query", type: "core/text" }],
          outputs: [{ id: "image", type: "core/image" }],
        }),
      ] as const,
    });

    expect(plugin.nodes).toHaveLength(1);
    expect(plugin.manifest.contributes.commands).toEqual([{ id: "open-gallery" }]);
    expect(plugin.manifest.contributes.nodes).toEqual(plugin.nodes);
  });

  it("rejects malformed node asset types before they leak into a manifest", () => {
    expect(() =>
      defineNode({
        type: "acme.gallery/search",
        title: "Search Gallery",
        inputs: [{ id: "query", type: "bad-type" }],
        outputs: [{ id: "image", type: "core/image" }],
      }),
    ).toThrow(/Port type must be a known core type/);

    expect(PluginNodeSchema.safeParse({
      type: "acme.gallery/search",
      title: "Search Gallery",
      inputs: [{ id: "query", type: "acme/text-query" }],
      outputs: [{ id: "image", type: "core/image" }],
    }).success).toBe(true);
  });

  it("exposes ui and executor helpers through stable subpath exports", () => {
    expect(createPluginHost).toBe(createHostFromUi);
    expect(acceptExecutorJob("job_1")).toEqual(acceptFromExecutor("job_1"));
    expect(PLUGIN_PROTOCOL_VERSION).toBe("1.0");
  });

  it("builds typed executor responses for synchronous and async handlers", () => {
    const request: ExecutorRequest<{ prompt: string }, { seed: number }> = {
      protocolVersion: PLUGIN_PROTOCOL_VERSION,
      plugin: "acme.gallery@1.0.0",
      nodeType: "acme.gallery/search",
      inputs: {
        prompt: "living room",
      },
      config: {
        seed: 7,
      },
    };

    const accepted = acceptExecutorJob("job_42");
    const completed = completeExecutorJob({
      outputs: {
        image: {
          id: "asset_1",
          type: "core/image",
          mimeType: "image/png",
          version: 1,
          size: 42,
          checksum: "abc",
          metadata: {
            prompt: request.inputs.prompt,
          },
        },
      },
      logs: ["queued", "rendered"],
    });

    expect(accepted).toEqual({
      externalJobId: "job_42",
      status: "accepted",
    });
    expect(completed.status).toBe("completed");
    expect(completed.result.outputs.image.metadata).toEqual({
      prompt: "living room",
    });
  });
});
