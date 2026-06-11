import { describe, expect, it, vi } from "vitest";

import { runWorkflow } from "./run-workflow";

describe("runWorkflow", () => {
  it("executes nodes in dependency order", async () => {
    const executor = vi.fn(async ({ nodeId }: { nodeId: string }) => ({
      nodeId,
      outputs: {},
    }));

    await runWorkflow(
      {
        projectId: "project_1",
        createdAt: "2026-06-11T00:00:00.000Z",
        nodes: [
          {
            id: "a",
            plugin: { id: "text", version: "0.1.0" },
            lockedAtRunStart: true,
          },
          {
            id: "b",
            plugin: { id: "text", version: "0.1.0" },
            lockedAtRunStart: true,
          },
          {
            id: "c",
            plugin: { id: "compose", version: "0.2.0" },
            lockedAtRunStart: true,
          },
        ],
        edges: [
          { source: "a", target: "c" },
          { source: "b", target: "c" },
        ],
      },
      executor,
    );

    expect(executor.mock.calls.map(([input]) => input.nodeId)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
