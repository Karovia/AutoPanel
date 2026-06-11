import { describe, expect, it } from "vitest";

import { createRunSnapshot } from "./validate-run";

describe("createRunSnapshot", () => {
  it("freezes node definitions and plugin versions into a snapshot", () => {
    const snapshot = createRunSnapshot({
      projectId: "project_1",
      nodes: [
        {
          id: "node_1",
          plugin: {
            id: "text",
            version: "0.1.0",
          },
        },
      ],
      edges: [],
    });

    expect(snapshot.projectId).toBe("project_1");
    expect(snapshot.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(snapshot.nodes).toEqual([
      {
        id: "node_1",
        plugin: {
          id: "text",
          version: "0.1.0",
        },
        lockedAtRunStart: true,
      },
    ]);
    expect(snapshot.edges).toEqual([]);
  });

  it("rejects cyclic graphs before creating a snapshot", () => {
    expect(() =>
      createRunSnapshot({
        projectId: "project_1",
        nodes: [
          { id: "a", plugin: { id: "text", version: "0.1.0" } },
          { id: "b", plugin: { id: "compose", version: "0.2.0" } },
        ],
        edges: [
          { source: "a", target: "b" },
          { source: "b", target: "a" },
        ],
      }),
    ).toThrow("Cycle detected");
  });

  it("rejects duplicate node ids before creating a snapshot", () => {
    expect(() =>
      createRunSnapshot({
        projectId: "project_1",
        nodes: [
          { id: "node_1", plugin: { id: "text", version: "0.1.0" } },
          { id: "node_1", plugin: { id: "compose", version: "0.2.0" } },
        ],
        edges: [],
      }),
    ).toThrow("Duplicate node IDs are not allowed");
  });
});
