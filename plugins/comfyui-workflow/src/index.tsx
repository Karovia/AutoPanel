import { createRoot } from "react-dom/client";

function App() {
  return (
    <form>
      <label>
        ComfyUI 地址
        <input
          defaultValue="https://comfyui.example.com"
          inputMode="url"
          name="baseUrl"
          type="url"
        />
      </label>
      <label>
        工作流 JSON
        <textarea aria-label="工作流 JSON" rows={8} />
      </label>
      <p>通过公网 HTTPS 的 ComfyUI `/prompt` 接口提交工作流。</p>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
