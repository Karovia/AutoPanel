import { describe, expect, it } from "vitest";

import { topologicallySortNodes } from "./graph";

describe("workflow graph", () => {
  it("returns a stable topological order for a DAG", () => {
    const order = topologicallySortNodes(
      ["text", "search", "compose"],
      [
        { source: "text", target: "search" },
        { source: "search", target: "compose" },
      ],
    );

    expect(order).toEqual(["text", "search", "compose"]);
  });

  it("throws when the graph contains a cycle", () => {
    expect(() =>
      topologicallySortNodes(
        ["a", "b"],
        [
          { source: "a", target: "b" },
          { source: "b", target: "a" },
        ],
      ),
    ).toThrow("Cycle detected");
  });

  it("throws a clear error for a dangling edge target", () => {
    expect(() =>
      topologicallySortNodes(
        ["text", "compose"],
        [{ source: "text", target: "search" }],
      ),
    ).toThrow('Invalid edge: target "search" is not in the node list');
  });

  it("throws a clear error for a dangling edge source", () => {
    expect(() =>
      topologicallySortNodes(
        ["search", "compose"],
        [{ source: "text", target: "compose" }],
      ),
    ).toThrow('Invalid edge: source "text" is not in the node list');
  });
});
