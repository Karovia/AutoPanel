export type WorkflowEdge = {
  source: string;
  target: string;
};

export type WorkflowNode = {
  id: string;
  pluginId: string;
};

export type WorkflowDefinition = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};
