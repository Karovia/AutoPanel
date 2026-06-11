import { createRoot } from "react-dom/client";

function App() {
  return (
    <label>
      文本输入
      <textarea aria-label="文本输入" rows={8} />
    </label>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
