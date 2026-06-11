import {
  PluginManifestSchema,
  type PluginManifest,
} from "../../protocol/src/plugin-manifest";

import { canUseCapability } from "./permissions";

type PluginContributionRecord = Record<string, unknown>;

type PluginNodeContribution = {
  inputs: unknown[];
  outputs: unknown[];
  title: string;
  type: string;
};

export type PluginNodeDefinition = PluginNodeContribution & {
  pluginId: string;
  pluginName: string;
  uiEntrypoint: string;
};

export type LoadedPluginManifest = {
  manifest: PluginManifest;
  nodeDefinitions: PluginNodeDefinition[];
};

export type PluginBridgeMessage = {
  capability?: string;
  method: string;
  params: unknown;
  source: "plugin";
};

export type PluginFrameBridge = {
  getNodeDefinitions(): PluginNodeDefinition[];
  handleMessage(event: MessageEvent<PluginBridgeMessage>): Promise<unknown>;
  registerFrame(pluginId: string, contentWindow: Window): void;
};

type CreatePluginHostOptions = {
  handlers?: Record<string, (params: unknown) => Promise<unknown> | unknown>;
  manifests: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWindowMessageSource(value: MessageEventSource | null): value is Window {
  return isRecord(value) && typeof value.postMessage === "function";
}

function isNodeContribution(value: unknown): value is PluginNodeContribution {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.inputs) &&
    Array.isArray(value.outputs)
  );
}

function getNodeContributions(contributes: PluginContributionRecord): PluginNodeContribution[] {
  const entries = contributes.nodes;

  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.filter(isNodeContribution);
}

export function loadPluginManifest(manifestLike: unknown): LoadedPluginManifest {
  const manifest = PluginManifestSchema.parse(manifestLike);
  const contributes = manifest.contributes as PluginContributionRecord;
  const nodeDefinitions = getNodeContributions(contributes).map((node) => ({
    ...node,
    pluginId: manifest.id,
    pluginName: manifest.name,
    uiEntrypoint: manifest.entrypoints.ui,
  }));

  return {
    manifest,
    nodeDefinitions,
  };
}

export function loadPluginManifests(manifests: unknown[]): LoadedPluginManifest[] {
  return manifests.map((manifest) => loadPluginManifest(manifest));
}

export function createPluginHost(options: CreatePluginHostOptions): PluginFrameBridge {
  const loadedPlugins = loadPluginManifests(options.manifests);
  const handlers = options.handlers ?? {};
  const frames = new Map<MessageEventSource, LoadedPluginManifest>();

  return {
    getNodeDefinitions() {
      return loadedPlugins.flatMap((plugin) => plugin.nodeDefinitions);
    },

    registerFrame(pluginId, contentWindow) {
      const plugin = loadedPlugins.find((candidate) => candidate.manifest.id === pluginId);

      if (!plugin) {
        throw new Error(`Unknown plugin "${pluginId}"`);
      }

      frames.set(contentWindow, plugin);
    },

    async handleMessage(event) {
      if (event.data?.source !== "plugin") {
        return undefined;
      }

      const sourceWindow = event.source;

      if (!isWindowMessageSource(sourceWindow)) {
        throw new Error("Received plugin message without a window source");
      }

      const plugin = frames.get(sourceWindow);

      if (!plugin) {
        throw new Error("Received plugin message from an unregistered frame");
      }

      if (
        event.data.capability &&
        !canUseCapability(plugin.manifest.permissions, event.data.capability)
      ) {
        throw new Error(
          `Plugin "${plugin.manifest.id}" cannot use capability "${event.data.capability}"`,
        );
      }

      const handler = handlers[event.data.method];

      if (!handler) {
        return undefined;
      }

      return handler(event.data.params);
    },
  };
}
