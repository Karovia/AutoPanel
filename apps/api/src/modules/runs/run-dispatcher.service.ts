import type { RunSnapshot } from "@package/workflow-core";
import { Injectable } from "@nestjs/common";

type DispatchRunInput = {
  runId: string;
  snapshot: RunSnapshot;
};

@Injectable()
export class RunDispatcherService {
  async dispatch(input: DispatchRunInput) {
    return {
      runId: input.runId,
      status: "queued" as const,
      queuedAt: new Date().toISOString(),
      nodeCount: input.snapshot.nodes.length,
    };
  }
}
