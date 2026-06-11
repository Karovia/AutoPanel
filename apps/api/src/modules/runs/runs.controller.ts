import type { Prisma } from "@prisma/client";
import { Body, Controller, Post } from "@nestjs/common";
import { RunsService } from "./runs.service";

@Controller("runs")
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  create(
    @Body()
    body: {
      projectId: string;
      trigger: string;
      snapshot: Prisma.InputJsonValue;
    },
  ) {
    return this.runsService.create(body);
  }
}
