export type ComfyuiQueuePromptInput = {
  baseUrl: string;
  workflow: Record<string, unknown>;
};

export type ComfyuiQueuePromptResult = {
  promptId: string;
};

type ComfyuiQueuePromptResponse = {
  prompt_id: string;
};

export class ComfyuiClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async queuePrompt(
    input: ComfyuiQueuePromptInput,
  ): Promise<ComfyuiQueuePromptResult> {
    const response = await this.fetcher(`${stripTrailingSlash(input.baseUrl)}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input.workflow,
      }),
    });

    if (!response.ok) {
      throw new Error(`ComfyUI prompt queue failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ComfyuiQueuePromptResponse;

    return {
      promptId: payload.prompt_id,
    };
  }
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
