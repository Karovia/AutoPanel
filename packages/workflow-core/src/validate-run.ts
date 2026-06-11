import { topologicallySortNodes, type Edge } from "#graph";
import type { RunSnapshot, SnapshotNode } from "#snapshot";

type CreateRunSnapshotInput = {
  projectId: string;
  nodes: Array<Pick<SnapshotNode, "id" | "plugin">>;
  edges: Edge[];
};

export function createRunSnapshot(input: CreateRunSnapshotInput): RunSnapshot {
  const nodeIds = input.nodes.map((node) => node.id);

  if (new Set(nodeIds).size !== nodeIds.length) {
    throw new Error("Duplicate node IDs are not allowed");
  }

  topologicallySortNodes(
    nodeIds,
    input.edges,
  );

  return {
    projectId: input.projectId,
    createdAt: new Date().toISOString(),
    nodes: input.nodes.map((node) => ({
      id: node.id,
      plugin: {
        id: node.plugin.id,
        version: node.plugin.version,
      },
      lockedAtRunStart: true,
    })),
    edges: input.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}
