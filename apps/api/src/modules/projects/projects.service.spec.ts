import type { Project } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { ProjectsService, type ProjectsDatabase } from "./projects.service";

describe("ProjectsService", () => {
  it("creates a project with an empty canvas document", async () => {
    const project: Project = {
      id: "project_1",
      name: "Demo Project",
      document: {
        schemaVersion: "1.0",
        nodes: [],
        edges: [],
        groups: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      createdAt: new Date("2026-06-11T00:00:00.000Z"),
      updatedAt: new Date("2026-06-11T00:00:00.000Z"),
    };
    const create = vi
      .fn<ProjectsDatabase["project"]["create"]>()
      .mockResolvedValue(project);
    const database: ProjectsDatabase = {
      project: { create },
    };
    const service = new ProjectsService(database);

    await expect(service.create({ name: "Demo Project" })).resolves.toMatchObject({
      name: "Demo Project",
      document: {
        schemaVersion: "1.0",
        nodes: [],
        edges: [],
        groups: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Demo Project",
        document: {
          schemaVersion: "1.0",
          nodes: [],
          edges: [],
          groups: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
    });
  });
});
