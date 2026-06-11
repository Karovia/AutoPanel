import { test as base } from "@playwright/test";
import { defineNetworkFixture, type NetworkFixture } from "@msw/playwright";
import type { AnyHandler } from "msw";

import { comfyuiHandlers } from "./fixtures/mock-comfyui";
import { ragflowHandlers } from "./fixtures/mock-ragflow";

type Fixtures = {
  handlers: AnyHandler[];
  network: NetworkFixture;
};

export const test = base.extend<Fixtures>({
  handlers: [[...ragflowHandlers, ...comfyuiHandlers], { option: true }],
  network: [
    async ({ context, handlers }, use) => {
      const network = defineNetworkFixture({
        context,
        handlers,
      });

      await network.enable();
      await use(network);
      await network.disable();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
