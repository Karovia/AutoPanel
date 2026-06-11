export const CoreAssetTypes = [
  "core/text",
  "core/prompt",
  "core/json",
  "core/image",
  "core/knowledge-context",
] as const;

export type CoreAssetType = (typeof CoreAssetTypes)[number];
