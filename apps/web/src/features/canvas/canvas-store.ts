import type { Edge, Node } from "@xyflow/react";

export type CanvasNodeData = {
  description?: string;
  title: string;
};

export type CanvasState = {
  edges: Edge[];
  nodes: Node<CanvasNodeData>[];
};

export function createInitialCanvasState(): CanvasState {
  return {
    nodes: [],
    edges: [],
  };
}
