"use client";

import { useEffect, useState } from "react";

import { loadPluginManifest } from "@package/plugin-runtime";
import type { PluginManifest } from "@package/protocol";

const STORAGE_KEY = "plugin-first-ai-canvas/imported-plugin-manifests";

export function useImportedPluginManifests() {
  const [manifests, setManifests] = useState<PluginManifest[]>([]);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown[];
      const loadedManifests = parsed.map((item) => loadPluginManifest(item).manifest);

      setManifests(loadedManifests);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function addManifest(manifest: PluginManifest) {
    setManifests((current) => {
      const next = [
        ...current.filter((item) => item.id !== manifest.id),
        manifest,
      ];

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  }

  function removeManifest(pluginId: string) {
    setManifests((current) => {
      const next = current.filter((item) => item.id !== pluginId);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  }

  return {
    addManifest,
    manifests,
    removeManifest,
  };
}
