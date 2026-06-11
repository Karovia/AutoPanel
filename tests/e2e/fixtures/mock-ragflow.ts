import { http, HttpResponse } from "msw";

export const ragflowHandlers = [
  http.post(/\/ragflow\/api\/v1\/retrieval$/, () =>
    HttpResponse.json({
      data: {
        chunks: [
          {
            content: "使用暖石色中性色调",
            score: 0.92,
            document_id: "doc_1",
            chunk_id: "chunk_1",
          },
        ],
      },
    }),
  ),
];
