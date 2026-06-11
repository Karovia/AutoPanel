import { z } from "zod";

export const PluginManifestSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  engine: z.object({
    host: z.string().min(1),
    sdk: z.string().min(1),
  }),
  entrypoints: z.object({
    ui: z.string().url(),
    executor: z.string().url().optional(),
    webhook: z.string().url().optional(),
  }),
  contributes: z.record(z.string(), z.array(z.unknown())).default({}),
  permissions: z.array(z.string()),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
