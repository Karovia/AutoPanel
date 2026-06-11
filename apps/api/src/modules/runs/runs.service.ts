import type { Prisma, WorkflowRun } from "@prisma/client";
import { Injectable } from "@nestjs/common";

export type RunsDatabase = {
  workflowRun: {
    create(args: Prisma.WorkflowRunCreateArgs): Promise<WorkflowRun>;
  };
};

@Injectable()
export class RunsService {
  constructor(private readonly database: RunsDatabase) {}

  create(input: {
    projectId: string;
    trigger: string;
    snapshot: Prisma.InputJsonValue;
  }) {
    return this.database.workflowRun.create({
      data: {
        projectId: input.projectId,
        trigger: input.trigger,
        status: "queued",
        snapshot: input.snapshot,
      },
    });
  }
}
