import { afterEach, describe, expect, it, vi } from "vitest";

import { RagflowClient } from "./ragflow.client";

describe("RagflowClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps retrieval chunks into knowledge context items", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          chunks: [
            {
              content: "Use warm stone neutrals",
              score: 0.94,
              document_id: "doc_1",
              chunk_id: "chunk_1",
            },
          ],
        },
      }),
    });
    const client = new RagflowClient(fetchMock as typeof fetch);

    const result = await client.search({
      baseUrl: "https://ragflow.example.com",
      apiKey: "secret",
      datasetId: "dataset_1",
      query: "brand palette guidance",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ragflow.example.com/api/v1/retrieval",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset_ids: ["dataset_1"],
          question: "brand palette guidance",
        }),
      },
    );
    expect(result.items[0].text).toBe("Use warm stone neutrals");
    expect(result.items).toEqual([
      {
        text: "Use warm stone neutrals",
        score: 0.94,
        citation: {
          documentId: "doc_1",
          chunkId: "chunk_1",
        },
      },
    ]);
  });
});
