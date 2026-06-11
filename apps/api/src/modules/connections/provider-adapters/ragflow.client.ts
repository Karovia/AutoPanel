export type RagflowSearchInput = {
  baseUrl: string;
  apiKey: string;
  datasetId: string;
  query: string;
};

export type KnowledgeContextItem = {
  text: string;
  score: number;
  citation: {
    documentId: string;
    chunkId: string;
  };
};

export type RagflowSearchResult = {
  items: KnowledgeContextItem[];
};

type RagflowRetrievalChunk = {
  content: string;
  score: number;
  document_id: string;
  chunk_id: string;
};

type RagflowRetrievalResponse = {
  data?: {
    chunks?: RagflowRetrievalChunk[];
  };
};

export class RagflowClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async search(input: RagflowSearchInput): Promise<RagflowSearchResult> {
    const response = await this.fetcher(`${stripTrailingSlash(input.baseUrl)}/api/v1/retrieval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataset_ids: [input.datasetId],
        question: input.query,
      }),
    });

    if (!response.ok) {
      throw new Error(`RAGFlow retrieval failed with status ${response.status}`);
    }

    const payload = (await response.json()) as RagflowRetrievalResponse;

    return {
      items: (payload.data?.chunks ?? []).map((chunk) => ({
        text: chunk.content,
        score: chunk.score,
        citation: {
          documentId: chunk.document_id,
          chunkId: chunk.chunk_id,
        },
      })),
    };
  }
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
