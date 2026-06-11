export type PluginExecutorInput = {
  nodeId: string;
};

export type PluginExecutorResult = {
  nodeId: string;
  outputs: Record<string, unknown>;
};

export async function executePluginNode(
  input: PluginExecutorInput,
): Promise<PluginExecutorResult> {
  return {
    nodeId: input.nodeId,
    outputs: {},
  };
}
