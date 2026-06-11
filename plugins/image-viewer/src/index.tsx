import { createRoot } from "react-dom/client";

function App() {
  return <div aria-label="图片预览">图片预览</div>;
}

createRoot(document.getElementById("root")!).render(<App />);
