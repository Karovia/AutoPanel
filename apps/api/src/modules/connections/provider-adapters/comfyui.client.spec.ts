import { afterEach, describe, expect, it, vi } from "vitest";

import { ComfyuiClient } from "./comfyui.client";

describe("ComfyuiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns promptId from prompt_id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        prompt_id: "prompt_123",
      }),
    });
    const client = new ComfyuiClient(fetchMock as typeof fetch);
    const workflow = {
      "1": {
        class_type: "KSampler",
        inputs: {},
      },
    };

    const result = await client.queuePrompt({
      baseUrl: "https://comfyui.example.com",
      workflow,
    });

    expect(fetchMock).toHaveBeenCalledWith("https://comfyui.example.com/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: workflow,
      }),
    });
    expect(result).toEqual({ promptId: "prompt_123" });
  });
});
