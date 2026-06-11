import { createRoot } from "react-dom/client";

import { plugin } from "./plugin";

function App() {
  return (
    <label>
      {plugin.nodes[0].title}
      <textarea aria-label={plugin.manifest.name} rows={8} />
    </label>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
