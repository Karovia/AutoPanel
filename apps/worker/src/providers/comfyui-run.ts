import {
  ComfyuiClient,
  type ComfyuiQueuePromptInput,
  type ComfyuiQueuePromptResult,
} from "../../../api/src/modules/connections/provider-adapters/comfyui.client";

export async function comfyuiRun(
  client: ComfyuiClient,
  input: ComfyuiQueuePromptInput,
): Promise<ComfyuiQueuePromptResult> {
  return client.queuePrompt(input);
}
