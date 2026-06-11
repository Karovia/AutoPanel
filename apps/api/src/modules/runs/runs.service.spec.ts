import type { Prisma, WorkflowRun } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RunsService, type RunsDatabase } from "./runs.service";

describe("RunsService", () => {
  it("creates a queued workflow run snapshot", async () => {
    const snapshot: Prisma.InputJsonValue = { nodes: [], edges: [] };
    const persistedSnapshot: Prisma.JsonObject = { nodes: [], edges: [] };
    const workflowRun: WorkflowRun = {
      id: "run_1",
      projectId: "project_1",
      trigger: "manual",
      status: "queued",
      snapshot: persistedSnapshot,
      createdAt: new Date("2026-06-11T00:00:00.000Z"),
    };
    const create = vi
      .fn<RunsDatabase["workflowRun"]["create"]>()
      .mockResolvedValue(workflowRun);
    const database: RunsDatabase = {
      workflowRun: { create },
    };
    const service = new RunsService(database);

    await expect(
      service.create({
        projectId: "project_1",
        trigger: "manual",
        snapshot,
      }),
    ).resolves.toMatchObject({
      status: "queued",
      projectId: "project_1",
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        projectId: "project_1",
        trigger: "manual",
        status: "queued",
        snapshot,
      },
    });
  });
});
