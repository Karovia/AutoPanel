import { PluginManifestSchema } from "../../protocol/src/index";

import {
  type PluginManifest,
  type PluginNodeDefinition,
  PluginNodeSchema,
} from "./protocol";

export { completeExecutorJob, acceptExecutorJob, PLUGIN_PROTOCOL_VERSION } from "./executor";
export type {
  AcceptedExecutorResponse,
  CompletedExecutorResponse,
  ExecutorOutputValue,
  ExecutorRequest,
  ExecutorResponse,
  ExecutorResult,
} from "./executor";
export {
  AssetRefSchema,
  CoreAssetTypes,
  PluginManifestSchema,
  PluginNodeSchema,
  PluginPortSchema,
} from "./protocol";
export type {
  AssetRef,
  CoreAssetType,
  PluginManifest,
  PluginNodeDefinition,
  PluginPortDefinition,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from "./protocol";
export { createPluginHost } from "./ui";
export type { PluginHostClient } from "./ui";

export type PluginDefinition<
  TNodes extends readonly PluginNodeDefinition[] = readonly PluginNodeDefinition[],
> = {
  manifest: PluginManifest;
  nodes: TNodes;
};

type DefinePluginOptions<TNodes extends readonly PluginNodeDefinition[]> = {
  manifest: Omit<PluginManifest, "contributes"> & {
    contributes?: Record<string, unknown[]>;
  };
  nodes?: TNodes;
};

export function definePluginManifest(manifestLike: unknown): PluginManifest {
  return PluginManifestSchema.parse(manifestLike);
}

export function defineNode<TNode extends PluginNodeDefinition>(node: TNode): TNode {
  return PluginNodeSchema.parse(node) as TNode;
}

export function definePlugin<TNodes extends readonly PluginNodeDefinition[]>(
  options: DefinePluginOptions<TNodes>,
): PluginDefinition<TNodes> {
  const nodes = (options.nodes ?? []) as TNodes;
  const contributes = {
    ...(options.manifest.contributes ?? {}),
    nodes: nodes.length > 0 ? [...nodes] : [],
  };
  const manifest = definePluginManifest({
    ...options.manifest,
    contributes,
  });

  return {
    manifest,
    nodes,
  };
}
