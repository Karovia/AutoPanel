import { http, HttpResponse } from "msw";

export const comfyuiHandlers = [
  http.post(/\/comfyui\/prompt$/, () =>
    HttpResponse.json({ prompt_id: "prompt_1" }),
  ),
  http.get(/\/comfyui\/history\/prompt_1$/, () =>
    HttpResponse.json({
      prompt_1: {
        outputs: {
          image: {
            images: [{ filename: "living-room.png" }],
          },
        },
      },
    }),
  ),
];
