import { createRoot } from "react-dom/client";

function App() {
  return (
    <form>
      <label>
        提示词模板
        <textarea aria-label="提示词模板" rows={8} />
      </label>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
