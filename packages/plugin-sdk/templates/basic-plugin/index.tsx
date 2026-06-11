import { createRoot } from "react-dom/client";

import { createPluginHost } from "@package/plugin-sdk";

import { plugin } from "./plugin";

const host = createPluginHost();

function App() {
  async function handlePingHost() {
    await host.call("jobs:create", {
      pluginId: plugin.manifest.id,
      type: plugin.nodes[0].type,
    });
  }

  return (
    <main>
      <h1>{plugin.manifest.name}</h1>
      <p>这是一个插件 UI 模板。你可以在这里采集参数并调用宿主能力。</p>
      <button onClick={handlePingHost} type="button">
        调用宿主
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
