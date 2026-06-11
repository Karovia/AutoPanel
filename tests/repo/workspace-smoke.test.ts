import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readWorkspacePatterns() {
  const workspaceFile = readFileSync(new URL("../../pnpm-workspace.yaml", import.meta.url), "utf8");

  return workspaceFile
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-+\s+["']?([^"']+)["']?$/, "$1"));
}

describe("workspace scaffold", () => {
  it("defines all top-level workspaces needed for phase 1", () => {
    expect(readWorkspacePatterns()).toEqual([
      "apps/*",
      "packages/*",
      "plugins/*",
      "tests/*",
    ]);
  });
});
