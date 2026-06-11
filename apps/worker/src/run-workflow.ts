import {
  topologicallySortNodes,
  type RunSnapshot,
} from "@package/workflow-core";

type ExecuteNode = (input: { nodeId: string }) => Promise<unknown>;

export async function runWorkflow(
  snapshot: RunSnapshot,
  executeNode: ExecuteNode,
): Promise<void> {
  const order = topologicallySortNodes(
    snapshot.nodes.map((node) => node.id),
    snapshot.edges,
  );

  for (const nodeId of order) {
    await executeNode({ nodeId });
  }
}
