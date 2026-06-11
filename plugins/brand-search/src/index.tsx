import { createRoot } from "react-dom/client";

import { plugin } from "./plugin";

function App() {
  return (
    <form>
      <label>
        RAGFlow 地址
        <input
          defaultValue="https://ragflow.example.com"
          inputMode="url"
          name="baseUrl"
          type="url"
        />
      </label>
      <label>
        数据集 ID
        <input defaultValue="brand-guidelines" name="datasetId" type="text" />
      </label>
      <label>
        品牌检索词
        <input name="query" type="search" />
      </label>
      <p>{plugin.manifest.name}通过公网 HTTPS 的 RAGFlow 检索 API 拉取品牌上下文。</p>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
