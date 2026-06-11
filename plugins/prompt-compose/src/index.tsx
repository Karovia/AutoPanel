import { createRoot } from "react-dom/client";

import { plugin } from "./plugin";

function App() {
  return (
    <form>
      <label>
        {plugin.manifest.name}模板
        <textarea aria-label="提示词模板" rows={8} />
      </label>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
