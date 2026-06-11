import type { AssetRef } from "./protocol";

export const PLUGIN_PROTOCOL_VERSION = "1.0";

export type ExecutorOutputValue = AssetRef | AssetRef[] | string | number | boolean | null | object;

export type ExecutorRequest<
  TInputs extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> = {
  protocolVersion: typeof PLUGIN_PROTOCOL_VERSION;
  plugin: string;
  nodeType: string;
  runId?: string;
  callbackUrl?: string;
  inputs: TInputs;
  config: TConfig;
};

export type ExecutorResult<
  TOutputs extends Record<string, ExecutorOutputValue> = Record<string, ExecutorOutputValue>,
> = {
  outputs: TOutputs;
  logs?: string[];
  metadata?: Record<string, unknown>;
};

export type AcceptedExecutorResponse = {
  status: "accepted";
  externalJobId: string;
};

export type CompletedExecutorResponse<
  TOutputs extends Record<string, ExecutorOutputValue> = Record<string, ExecutorOutputValue>,
> = {
  status: "completed";
  result: ExecutorResult<TOutputs>;
};

export type ExecutorResponse<
  TOutputs extends Record<string, ExecutorOutputValue> = Record<string, ExecutorOutputValue>,
> = AcceptedExecutorResponse | CompletedExecutorResponse<TOutputs>;

export function acceptExecutorJob(externalJobId: string): AcceptedExecutorResponse {
  return {
    externalJobId,
    status: "accepted",
  };
}

export function completeExecutorJob<
  TOutputs extends Record<string, ExecutorOutputValue> = Record<string, ExecutorOutputValue>,
>(result: ExecutorResult<TOutputs>): CompletedExecutorResponse<TOutputs> {
  return {
    result,
    status: "completed",
  };
}
