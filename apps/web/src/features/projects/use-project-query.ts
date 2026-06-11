import { useEffect, useState } from "react";

export type InstalledPlugin = {
  description: string;
  id: string;
  name: string;
};

export type ProjectSummary = {
  id: string;
  installedPlugins: InstalledPlugin[];
  name: string;
};

const placeholderProject: ProjectSummary = {
  id: "local-project",
  name: "项目画布",
  installedPlugins: [
    {
      id: "asset-library",
      name: "资源库",
      description: "用于即将接入的 iframe 插件能力的占位插件。",
    },
    {
      id: "workflow-logger",
      name: "工作流日志",
      description: "用于展示宿主外壳在运行时接线完成前也能列出已安装插件。",
    },
  ],
};

export function useProjectQuery() {
  const [data, setData] = useState<ProjectSummary>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setData(placeholderProject);
      setIsLoading(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    data,
    isLoading,
  };
}
