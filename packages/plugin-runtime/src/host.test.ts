// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import brandSearchManifest from "../../../plugins/brand-search/manifest.json";
import textInputManifest from "../../../plugins/text-input/manifest.json";

import { createPluginHost, type PluginBridgeMessage } from "./host";
import { canUseCapability } from "./permissions";

function createFrameWindow() {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  return {
    cleanup() {
      iframe.remove();
    },
    window: iframe.contentWindow!,
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("plugin runtime", () => {
  it("rejects capabilities missing from the granted list", () => {
    expect(canUseCapability(["assets:create"], "jobs:create")).toBe(false);
  });

  it("loads node definitions from an official plugin manifest", () => {
    const host = createPluginHost({
      manifests: [textInputManifest],
    });

    expect(host.getNodeDefinitions()).toEqual([
      {
        inputs: [],
        outputs: [{ id: "text", type: "core/text" }],
        pluginId: "core.text-input",
        pluginName: "文本输入",
        title: "文本输入",
        type: "core.text-input/node",
        uiEntrypoint: "http://localhost:4101/index.html",
      },
    ]);
  });

  it("returns a handler result for a registered frame with a permitted capability", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const host = createPluginHost({
      handlers: {
        "jobs:create": handler,
      },
      manifests: [brandSearchManifest],
    });
    const frame = createFrameWindow();

    host.registerFrame("core.brand-search", frame.window);

    await expect(
      host.handleMessage({
        data: {
          capability: "jobs:create",
          method: "jobs:create",
          params: { prompt: "living room palette" },
          source: "plugin",
        },
        source: frame.window,
      } as MessageEvent<PluginBridgeMessage>),
    ).resolves.toEqual({ ok: true });

    expect(handler).toHaveBeenCalledWith({ prompt: "living room palette" });

    frame.cleanup();
  });

  it("rejects a message from an unregistered frame", async () => {
    const host = createPluginHost({
      handlers: {
        "jobs:create": vi.fn(),
      },
      manifests: [brandSearchManifest],
    });
    const frame = createFrameWindow();

    await expect(
      host.handleMessage({
        data: {
          capability: "jobs:create",
          method: "jobs:create",
          params: {},
          source: "plugin",
        },
        source: frame.window,
      } as MessageEvent<PluginBridgeMessage>),
    ).rejects.toThrow("Received plugin message from an unregistered frame");

    frame.cleanup();
  });

  it("rejects a forbidden capability from a registered frame", async () => {
    const host = createPluginHost({
      handlers: {
        "jobs:create": vi.fn(),
      },
      manifests: [textInputManifest],
    });
    const frame = createFrameWindow();

    host.registerFrame("core.text-input", frame.window);

    await expect(
      host.handleMessage({
        data: {
          capability: "jobs:create",
          method: "jobs:create",
          params: {},
          source: "plugin",
        },
        source: frame.window,
      } as MessageEvent<PluginBridgeMessage>),
    ).rejects.toThrow('Plugin "core.text-input" cannot use capability "jobs:create"');

    frame.cleanup();
  });
});
