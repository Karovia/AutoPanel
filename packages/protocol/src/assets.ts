import { z } from "zod";

import { CoreAssetTypes } from "@package/asset-types";

const coreAssetTypes = new Set<string>(CoreAssetTypes);

const namespacedAssetTypePattern = /^[^/\s]+\/[^/\s]+$/;

export const AssetRefSchema = z.object({
  id: z.string(),
  type: z.string().refine(
    (value) =>
      coreAssetTypes.has(value) ||
      (namespacedAssetTypePattern.test(value) && !value.startsWith("core/")),
    {
      message: "Asset type must be a known core type or a namespaced <namespace>/<name> string",
    },
  ),
  mimeType: z.string(),
  version: z.number().int().positive(),
  size: z.number().int().nonnegative(),
  checksum: z.string(),
  metadata: z.record(z.string(), z.unknown()),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;
