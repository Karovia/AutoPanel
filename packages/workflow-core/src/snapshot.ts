import type { Edge } from "#graph";

export type SnapshotNode = {
  id: string;
  plugin: {
    id: string;
    version: string;
  };
  lockedAtRunStart: boolean;
};

export type RunSnapshot = {
  projectId: string;
  createdAt: string;
  nodes: SnapshotNode[];
  edges: Edge[];
};
