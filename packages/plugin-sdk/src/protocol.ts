import { z } from "zod";

import { CoreAssetTypes } from "../../asset-types/src/index";
import { AssetRefSchema, PluginManifestSchema } from "../../protocol/src/index";

const coreAssetTypes = new Set<string>(CoreAssetTypes);
const namespacedAssetTypePattern = /^[^/\s]+\/[^/\s]+$/;

function isKnownAssetType(value: string) {
  return (
    coreAssetTypes.has(value) ||
    (namespacedAssetTypePattern.test(value) && !value.startsWith("core/"))
  );
}

export const PluginPortSchema = z.object({
  id: z.string().min(1),
  type: z.string().refine(isKnownAssetType, {
    message: "Port type must be a known core type or a namespaced <namespace>/<name> string",
  }),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export const PluginNodeSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  inputs: z.array(PluginPortSchema),
  outputs: z.array(PluginPortSchema),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type PluginPortDefinition = z.infer<typeof PluginPortSchema>;
export type PluginNodeDefinition = z.infer<typeof PluginNodeSchema>;

export { AssetRefSchema, CoreAssetTypes, PluginManifestSchema };
export type { CoreAssetType } from "../../asset-types/src/index";
export type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "../../protocol/src/index";
