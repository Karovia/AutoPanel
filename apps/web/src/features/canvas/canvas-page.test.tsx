import { render, screen } from "@testing-library/react";

import { CanvasPage } from "./canvas-page";

describe("CanvasPage", () => {
  it("renders the host canvas shell", async () => {
    render(<CanvasPage />);

    expect(
      await screen.findByRole("heading", { name: "项目画布" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "已安装插件" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "官方节点类型" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "导入插件" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "服务配置" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "核心闭环验证" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "运行工作流" }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("文本输入")).toBeInTheDocument();
    expect(await screen.findByText("文本输入 - core.text-input/node")).toBeInTheDocument();
    expect(await screen.findAllByLabelText("服务地址")).toHaveLength(2);
    expect(await screen.findByLabelText("数据集 ID")).toBeInTheDocument();
    expect(await screen.findByLabelText("API Key")).toBeInTheDocument();
  });
});
