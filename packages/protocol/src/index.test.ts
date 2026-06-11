import { describe, expect, it } from "vitest";

import { AssetRefSchema, PluginManifestSchema } from "./index";

describe("protocol schemas", () => {
  it("accepts a core image asset ref", () => {
    const result = AssetRefSchema.safeParse({
      id: "asset_1",
      type: "core/image",
      mimeType: "image/png",
      version: 1,
      size: 42,
      checksum: "abc",
      metadata: {},
    });

    expect(result.success).toBe(true);
  });

  it("accepts a custom namespaced asset type", () => {
    const result = AssetRefSchema.safeParse({
      id: "asset_2",
      type: "acme/semantic-mask",
      mimeType: "application/json",
      version: 2,
      size: 128,
      checksum: "def",
      metadata: {},
    });

    expect(result.success).toBe(true);
  });

  it("rejects a malformed asset type", () => {
    const result = AssetRefSchema.safeParse({
      id: "asset_3",
      type: "malformed-type",
      mimeType: "text/plain",
      version: 1,
      size: 1,
      checksum: "ghi",
      metadata: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown type in the reserved core namespace", () => {
    const result = AssetRefSchema.safeParse({
      id: "asset_4",
      type: "core/not-real",
      mimeType: "application/json",
      version: 1,
      size: 1,
      checksum: "jkl",
      metadata: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects manifest without id", () => {
    const result = PluginManifestSchema.safeParse({
      schemaVersion: "1.0",
      name: "broken",
      version: "0.0.1",
      engine: { host: "^1.0.0", sdk: "^1.0.0" },
      entrypoints: { ui: "https://example.com/plugin/index.html" },
      contributes: {},
      permissions: [],
    });

    expect(result.success).toBe(false);
  });
});
