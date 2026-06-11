import { createRoot } from "react-dom/client";

import { plugin } from "./plugin";

function App() {
  return <div aria-label={plugin.manifest.name}>{plugin.manifest.name}</div>;
}

createRoot(document.getElementById("root")!).render(<App />);
