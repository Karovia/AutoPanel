type CacheKeyInput = {
  projectId: string;
  nodeId: string;
  plugin: {
    id: string;
    version: string;
  };
};

export function createNodeCacheKey(input: CacheKeyInput): string {
  return [
    input.projectId,
    input.nodeId,
    input.plugin.id,
    input.plugin.version,
  ].join(":");
}
