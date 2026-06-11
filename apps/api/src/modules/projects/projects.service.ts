import type { Prisma, Project } from "@prisma/client";
import { Injectable } from "@nestjs/common";

export type ProjectsDatabase = {
  project: {
    create(args: Prisma.ProjectCreateArgs): Promise<Project>;
  };
};

const EMPTY_CANVAS_DOCUMENT = {
  schemaVersion: "1.0",
  nodes: [],
  edges: [],
  groups: [],
  viewport: { x: 0, y: 0, zoom: 1 },
} satisfies Prisma.InputJsonObject;

@Injectable()
export class ProjectsService {
  constructor(private readonly database: ProjectsDatabase) {}

  create(input: { name: string }) {
    return this.database.project.create({
      data: {
        name: input.name,
        document: EMPTY_CANVAS_DOCUMENT,
      },
    });
  }
}
