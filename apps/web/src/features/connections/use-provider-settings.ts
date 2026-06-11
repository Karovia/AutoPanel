"use client";

import { useEffect, useMemo, useState } from "react";

import type { ComfyuiSettings, RagflowSettings } from "./provider-config-panel";

const STORAGE_KEY = "plugin-first-ai-canvas/provider-settings";

type ProviderSettingsState = {
  comfyui: ComfyuiSettings;
  ragflow: RagflowSettings;
};

export function useProviderSettings() {
  const defaults = useMemo(() => createDefaultProviderSettings(), []);
  const [settings, setSettings] = useState<ProviderSettingsState>(defaults);
  const [statusMessage, setStatusMessage] = useState("当前使用同服务器默认配置。");

  useEffect(() => {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<ProviderSettingsState>;

      setSettings({
        ragflow: {
          ...defaults.ragflow,
          ...parsed.ragflow,
        },
        comfyui: {
          ...defaults.comfyui,
          ...parsed.comfyui,
        },
      });
      setStatusMessage("已加载已保存的服务配置。");
    } catch {
      setStatusMessage("本地保存的服务配置无法解析，已回退到默认值。");
    }
  }, [defaults]);

  function saveSettings() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setStatusMessage("服务配置已保存。");
  }

  function resetDefaults() {
    window.localStorage.removeItem(STORAGE_KEY);
    setSettings(defaults);
    setStatusMessage("已恢复同服务器默认配置。");
  }

  return {
    comfyui: settings.comfyui,
    ragflow: settings.ragflow,
    resetDefaults,
    saveSettings,
    setComfyui(settings: ComfyuiSettings) {
      setSettings((current) => ({
        ...current,
        comfyui: settings,
      }));
    },
    setRagflow(settings: RagflowSettings) {
      setSettings((current) => ({
        ...current,
        ragflow: settings,
      }));
    },
    statusMessage,
  };
}

export function createDefaultProviderSettings(origin = getBrowserOrigin()): ProviderSettingsState {
  return {
    ragflow: {
      apiKey: "",
      baseUrl: `${origin}/ragflow`,
      datasetId: "brand-guidelines",
    },
    comfyui: {
      baseUrl: `${origin}/comfyui`,
    },
  };
}

function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  return window.location.origin;
}
