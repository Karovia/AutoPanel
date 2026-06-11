import type { RunSnapshot } from "@package/workflow-core";

export type RunQueueJob = {
  runId: string;
  snapshot: RunSnapshot;
};

export class InMemoryRunQueue {
  readonly jobs: RunQueueJob[] = [];

  async enqueue(job: RunQueueJob): Promise<void> {
    this.jobs.push(job);
  }
}
